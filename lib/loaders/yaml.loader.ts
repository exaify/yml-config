import { StageEnvType } from '../types';
import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { resolve, join, isAbsolute } from 'path';
import * as yaml from 'js-yaml';
import { APP_CONFIG_FILE } from '../config.constants';

const STAGE_MAP: { [k: string]: StageEnvType } = {
  development: 'dev',
  develop: 'dev',
  dev: 'dev',
  test: 'test',
  stage: 'stage',
  production: 'prod',
  prod: 'prod',
};
/**
 * If you modify yml config basedir you can SET env.YML_CONF_BASE
 *
 */
export const yamlConfigLoader = () => {
  const stage = process.env.STAGE || 'prod';

  let confBaseDir = process.env.YML_CONF_BASE;
  if (!confBaseDir?.length) confBaseDir = '.conf';

  const appYmlBase = process.cwd();
  const ymlEnvBaseName = STAGE_MAP[stage] ?? STAGE_MAP['prod'];

  const confDir = isAbsolute(confBaseDir)
    ? join(confBaseDir, ymlEnvBaseName)
    : join(appYmlBase, confBaseDir, ymlEnvBaseName);

  if (!existsSync(resolve(confDir, APP_CONFIG_FILE))) {
    throw new Error(`App miss config file ${APP_CONFIG_FILE} in ${confDir}`);
  }

  const files =
    readdirSync(confDir, { recursive: false, encoding: 'utf-8' }) ?? [];

  const configs = files
    .filter(f => f.toLowerCase() !== APP_CONFIG_FILE)
    .filter(f => f.endsWith('.yml'))
    .filter(f => statSync(resolve(confDir, f)).isFile());

  console.log(
    `Stage Mode [${stage}]:load app config [\x1B[34m${APP_CONFIG_FILE}\x1B[0m]`,
  );

  const appConfigKvs = yaml.load(
    readFileSync(resolve(confDir, APP_CONFIG_FILE), 'utf-8'),
  ) as Record<string, any>;

  let kvs: Record<string, any> = {};

  configs.forEach(f => {
    const someKvs = yaml.load(
      readFileSync(resolve(confDir, f), 'utf-8'),
    ) as Record<string, any>;
    kvs = {
      ...kvs,
      ...someKvs,
    };
  });

  if (ymlEnvBaseName === 'dev') {
    console.warn(
      `Application load configuration \x1B[34m${files.join(',')}\x1B[0m`,
    );
  }

  return {
    ...kvs,
    ...appConfigKvs,
  };
};
