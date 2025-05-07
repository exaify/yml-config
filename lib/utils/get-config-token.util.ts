/**
 * @publicApi
 */
export function getConfigToken(token: string | symbol): string {
  return `YMLCONFIGURATION(${token.toString()})`;
}
