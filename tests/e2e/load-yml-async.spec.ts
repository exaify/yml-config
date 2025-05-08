import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('Async YML loader', () => {
  let app: INestApplication;

  describe('YML BASE relative', () => {
    beforeEach(async () => {
      const module = await Test.createTestingModule({
        imports: [AppModule.withLoadedYmlAsyncConfigurations()],
      }).compile();

      app = module.createNestApplication();

      await app.init();
    });

    it(`should return loaded configuration app.yml`, () => {
      const appName = app.get(AppModule).getAppName();
      expect(appName).toEqual('exaify-app');
    });

    it(`should return loaded configuration from some.yml`, () => {
      const mysqlType = app
        .get(AppModule)
        .getYmlNestedConfiguration('mysql.type');
      expect(mysqlType).toEqual('mysql');
    });

    afterEach(async () => {
      await app.close();
    });
  });

  describe('YML BASE absolute', () => {
    beforeEach(async () => {
      const module = await Test.createTestingModule({
        imports: [AppModule.withLoadedAbsulteYmlAsyncConfigurations()],
      }).compile();

      app = module.createNestApplication();

      await app.init();
    });

    it(`should return loaded configuration app.yml`, () => {
      const appName = app.get(AppModule).getAppName();
      expect(appName).toEqual('exaify-app');
    });

    it(`should return loaded configuration from some.yml`, () => {
      const mysqlType = app
        .get(AppModule)
        .getYmlNestedConfiguration('mysql.type');
      expect(mysqlType).toEqual('mysql');
    });

    afterEach(async () => {
      await app.close();
    });
  });
});
