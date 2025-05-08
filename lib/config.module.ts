import { DynamicModule, Module } from '@nestjs/common';
import { YmlConfigHostModule } from './config-host.module';
import { ConfigService } from './config.service';
import {
  CONFIGURATION_LOADER,
  CONFIGURATION_SERVICE_TOKEN,
  CONFIGURATION_TOKEN,
  VALIDATED_ENV_LOADER,
  VALIDATED_ENV_PROPNAME,
} from './config.constants';
import { ConfigFactory, ConfigModuleOptions } from './interfaces';
import { resolve } from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { DotenvExpandOptions, expand } from 'dotenv-expand';
import { isObject } from '@nestjs/common/utils/shared.utils';
import { FactoryProvider } from '@nestjs/common/interfaces';
import {
  ConfigFactoryKeyHost,
  createConfigProvider,
  getRegistrationToken,
  mergeConfigObject,
} from './utils';

@Module({
  imports: [YmlConfigHostModule],
  providers: [
    {
      provide: ConfigService,
      useExisting: CONFIGURATION_SERVICE_TOKEN,
    },
  ],
  exports: [YmlConfigHostModule, ConfigService],
})
export class YmlConfigModule {
  /**
   * This promise resolves when "dotenv" completes loading environment variables.
   * When "ignoreEnvFile" is set to true, then it will resolve immediately after the
   * "YmlConfigModule#forRoot" method is called.
   */
  public static get envVariablesLoaded() {
    return this._envVariablesLoaded;
  }

  private static environmentVariablesLoadedSignal: () => void;
  private static readonly _envVariablesLoaded = new Promise<void>(
    resolve => (YmlConfigModule.environmentVariablesLoadedSignal = resolve),
  );

  /**
   * oads environment variables based on the "ignoreEnvFile" flag and "envFilePath" value.
   * Additionally, registers custom configurations globally.
   * @param options ConfigModuleOptions<V>
   * @returns DynamicModule
   */
  static async forRoot<ValidationOptions extends Record<string, any>>(
    options: ConfigModuleOptions<ValidationOptions> = {},
  ): Promise<DynamicModule> {
    const envFilePaths = Array.isArray(options.envFilePath)
      ? options.envFilePath
      : [options.envFilePath || resolve(process.cwd(), '.env')];

    let validatedEnvConfig: Record<string, any> | undefined = undefined;

    let config = options.ignoreEnvFile
      ? {}
      : this.loadEnvFile(envFilePaths, options);

    if (!options.ignoreEnvVars && options.validatePredefined !== false) {
      config = {
        ...config,
        ...process.env,
      };
    }

    // ymlbase handle
    if (options.ymlBase?.length) {
      config = {
        ...config,
        YML_CONF_BASE: options.ymlBase,
      };
      this.assignVariablesToProcess(config);
    }

    // validating environment variables
    if (options.validate) {
      const validatedConfig = options.validate(config);
      validatedEnvConfig = validatedConfig;
      this.assignVariablesToProcess(validatedConfig);
    } else if (options.validationSchema) {
      const validationOptions = this.getSchemaValidationOptions(options);

      const { error, value: validatedConfig } =
        options.validationSchema.validate(config, validationOptions);

      if (error) {
        throw new Error(`Config validation error: ${error.message}`);
      }

      validatedEnvConfig = validatedConfig;
      this.assignVariablesToProcess(validatedConfig);
    } else {
      this.assignVariablesToProcess(config);
    }

    const isConfigToLoad = options.load && options.load.length;
    const configFactory = await Promise.all(options.load || []);

    const providers = configFactory
      .map(factory =>
        createConfigProvider(factory as ConfigFactory & ConfigFactoryKeyHost),
      )
      .filter(item => item);

    const configProviderTokens = providers.map(it => it.provide);

    const configServiceProvider = {
      provide: ConfigService,
      useFactory: (configService: ConfigService) => {
        const untypedConfigService = configService as any;
        if (options.cache) {
          untypedConfigService.isCacheEnabled = true;
        }

        if (options.skipProcessEnv) {
          untypedConfigService.skipProcessEnv = true;
        }

        configService.setEnvFilePaths(envFilePaths);

        return configService;
      },
      inject: [CONFIGURATION_SERVICE_TOKEN, ...configProviderTokens],
    };

    // put the configServiceProvider into providers
    providers.push(configServiceProvider);

    if (validatedEnvConfig) {
      const validatedEnvConfigLoader = {
        provide: VALIDATED_ENV_LOADER,
        useFactory: (host: Record<string, any>) => {
          host[VALIDATED_ENV_PROPNAME] = validatedEnvConfig;
        },
        inject: [CONFIGURATION_TOKEN],
      };

      providers.push(validatedEnvConfigLoader);
    }

    this.environmentVariablesLoadedSignal();

    // Dynamic
    return {
      module: YmlConfigModule,
      global: options.isGlobal,
      providers: isConfigToLoad
        ? [
            ...providers,
            {
              provide: CONFIGURATION_LOADER,
              useFactory: (
                host: Record<string, any>,
                ...configurations: Record<string, any>[]
              ) => {
                configurations.forEach((item, index) =>
                  this.mergePartial(host, item, providers[index]),
                );
              },
              inject: [CONFIGURATION_TOKEN, ...configProviderTokens],
            },
          ]
        : providers,
      exports: [ConfigService, ...configProviderTokens],
    };
  }

  /**
   * Registers configuration object (partial registration).
   * @param config
   */
  static forFeature(config: ConfigFactory): DynamicModule {
    const configProvider = createConfigProvider(
      config as ConfigFactory & ConfigFactoryKeyHost,
    );

    const serviceProvider = {
      provide: ConfigService,
      useFactory: (configService: ConfigService) => configService,
      inject: [CONFIGURATION_SERVICE_TOKEN, configProvider.provide],
    };

    return {
      module: YmlConfigModule,
      providers: [
        configProvider,
        serviceProvider,
        {
          provide: CONFIGURATION_LOADER,
          useFactory: (
            host: Record<string, any>,
            partialConfig: Record<string, any>,
          ) => {
            this.mergePartial(host, partialConfig, configProvider);
          },
          inject: [CONFIGURATION_TOKEN, configProvider.provide],
        },
      ],
      exports: [ConfigService, configProvider.provide],
    };
  }

  private static loadEnvFile(
    envFilePaths: string[],
    options: ConfigModuleOptions,
  ): Record<string, any> {
    let config: ReturnType<typeof dotenv.parse> = {};
    for (const envFilePath of envFilePaths) {
      if (fs.existsSync(envFilePath)) {
        config = Object.assign(
          dotenv.parse(fs.readFileSync(envFilePath)),
          config,
        );

        if (options.expandVariables) {
          const expandOptions: DotenvExpandOptions =
            typeof options.expandVariables === 'object'
              ? options.expandVariables
              : {};

          config =
            expand({ ...expandOptions, parsed: config }).parsed || config;
        }
      }
    }

    return config;
  }

  private static assignVariablesToProcess(
    config: Record<string, unknown>,
  ): void {
    if (!isObject(config)) {
      return;
    }

    const keys = Object.keys(config).filter(k => !(k in process.env));

    keys.forEach(key => {
      const value = config[key];
      if (typeof value === 'string') {
        process.env[key] = value;
      } else if (typeof value === 'boolean' || typeof value === 'number') {
        process.env[key] = `${value}`;
      }
    });
  }

  private static mergePartial(
    host: Record<string, any>,
    item: Record<string, any>,
    provider: FactoryProvider,
  ): void {
    const factoryRef = provider.useFactory;
    const token = getRegistrationToken(factoryRef);
    mergeConfigObject(host, item, token);
  }

  private static getSchemaValidationOptions(
    options: ConfigModuleOptions,
  ): Record<string, any> {
    if (options.validationOptions) {
      if (typeof options.validationOptions.allowUnknown === 'undefined') {
        options.validationOptions.allowUnknown = true;
      }

      return options.validationOptions;
    }

    return {
      abortEarly: false,
      allowUnknown: true,
    };
  }
}
