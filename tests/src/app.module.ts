import { DynamicModule, Inject, Module, Optional } from '@nestjs/common';
import { ConfigType } from '../../dist';
import { ConfigService } from '../../lib/config.service';

import databaseConfig from './database.config';
import nestedDatabaseConfig from './nested-database.config';
import { YmlConfigModule } from '../../lib/config.module';
import { join } from 'path';
import symbolDatabaseConfig, {
  DATABASE_SYMBOL_TOKEN,
} from './symbol-database.config';
import { yamlConfigLoader } from '../../lib';

type Config = {
  database: ConfigType<typeof databaseConfig> & {
    driver: ConfigType<typeof nestedDatabaseConfig>;
  };
};

interface ConfigTypeAsInterface {
  database: ConfigType<typeof databaseConfig> & {
    dirver: ConfigType<typeof nestedDatabaseConfig>;
  };
}

@Module({})
export class AppModule {
  constructor(
    private readonly configService: ConfigService,
    private readonly configServiceNarrowed: ConfigService<Config, true>,
    private readonly configServiceNarrowed2: ConfigService<
      ConfigTypeAsInterface,
      true
    >,

    @Optional()
    @Inject(databaseConfig.KEY)
    private readonly dbConfig: ConfigType<typeof databaseConfig>,
  ) {}

  /**
   * This method is not meant to be used anywhere! It just here for testing
   * types defintions while runnig test suites (in some sort).
   * If some typings doesn't follows the requirements, Jest will fail due to
   * TypeScript errors.
   */
  private noop(): void {
    // Arrange
    const identityString = (v: string) => v;
    const identityNumber = (v: number) => v;

    // Act
    const knowConfig =
      this.configServiceNarrowed.get<Config['database']>('database');
    // Assert
    // We don't need type assertions bellow anymore since `knowConfig` is not
    // expected to be `undefined` beforehand.
    identityString(knowConfig.host);
    identityNumber(knowConfig.port);
    identityString(knowConfig.driver.host);
    identityNumber(knowConfig.driver.port);
  }

  static withCache(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        YmlConfigModule.forRoot({
          cache: true,
          envFilePath: join(__dirname, '.env'),
          load: [databaseConfig],
        }),
      ],
    };
  }

  static withEnvVars(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        YmlConfigModule.forRoot({
          envFilePath: join(__dirname, '.env'),
          load: [() => ({ obj: { test: 'true', test2: undefined } })],
        }),
      ],
    };
  }

  static withForFeature(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        YmlConfigModule.forRoot(),
        YmlConfigModule.forFeature(databaseConfig),
      ],
    };
  }

  static withLoadedAsyncConfigurations(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        YmlConfigModule.forRoot({
          load: [Promise.resolve(databaseConfig)],
        }),
      ],
    };
  }

  static withLoadedYmlAsyncConfigurations(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        YmlConfigModule.forRoot({
          load: [yamlConfigLoader],
          ymlBase: 'tests/.conf',
        }),
      ],
    };
  }

  static withLoadedAbsulteYmlAsyncConfigurations(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        YmlConfigModule.forRoot({
          load: [yamlConfigLoader],
          ymlBase: join(__dirname, '.conf'),
        }),
      ],
    };
  }

  static withNestedLoadedConfigurations(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        YmlConfigModule.forRoot({
          load: [nestedDatabaseConfig],
        }),
      ],
    };
  }

  static withSymbolLoadedConfigurations(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        YmlConfigModule.forRoot({
          load: [symbolDatabaseConfig],
        }),
      ],
    };
  }

  static withLoadedConfigurations(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        YmlConfigModule.forRoot({
          load: [databaseConfig],
        }),
      ],
    };
  }

  // instance method
  getDatabaseHost() {
    return this.configService.get('database.host');
  }

  getAppName() {
    return this.configService.get('app.name');
  }

  getYmlNestedConfiguration(propertyPath: string) {
    return this.configService.get(propertyPath);
  }

  getDatabaseConfig() {
    return this.dbConfig;
  }

  getNestedDatabaseHost() {
    return this.configService.get('database.driver.host');
  }

  getSymbolDatabaseConfig() {
    return this.configService.get(DATABASE_SYMBOL_TOKEN);
  }
}
