import { registerAs } from '../../lib/utils';

export default registerAs('database', () => ({
  host: 'host',
  port: 3306,
}));
