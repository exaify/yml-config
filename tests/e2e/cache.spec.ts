import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ConfigService } from '../../lib/config.service';

describe('Cache', () => {
  let app: INestApplication;
  let envBackup: NodeJS.ProcessEnv;

  beforeAll(() => {
    envBackup = {
      ...process.env,
    };
  });

  /**
   * Unit Test without cache
   */
  describe('without cache', () => {
    beforeAll(async () => {
      process.env['NAME'] = 'TEST';
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule.withEnvVars()],
      }).compile();

      app = moduleRef.createNestApplication();

      await app.init();
    });

    it(`should return loaded env variables from vars`, () => {
      const configService = app.get(ConfigService);

      expect(configService.get('NAME')).toEqual('TEST');
    });

    it(`should return new vars`, () => {
      process.env['NAME'] = 'CHANGED';
      const configService = app.get(ConfigService);
      expect(configService.get('NAME')).toEqual('CHANGED');
    });
  });

  /**
   * Unit Test with cache
   */
  describe('with cache', () => {
    beforeAll(async () => {
      process.env['NAME'] = 'TEST';

      const moduleRef = await Test.createTestingModule({
        imports: [AppModule.withCache()],
      }).compile();
      app = moduleRef.createNestApplication();
      await app.init();
    });

    it(`should return loaded env variables from vars`, () => {
      const configService = app.get(ConfigService);
      expect(configService.get('NAME')).toEqual('TEST');
    });

    it(`should return cached vars`, () => {
      process.env['NAME'] = 'CHANGED';
      const configService = app.get(ConfigService);
      expect(configService.get('NAME')).toEqual('TEST');
    });
  });

  afterEach(async () => {
    process.env = {
      ...envBackup,
    };

    await app.close();
  });
});
