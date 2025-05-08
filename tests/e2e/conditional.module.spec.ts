import { DynamicModule, Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { YmlConfigModule, ConditionalModule } from '../../lib';
import { join } from 'path';

@Injectable()
class FooService {}

@Injectable()
class FooDynamicService {}

@Module({
  providers: [FooService],
  exports: [FooService],
})
class FooModule {
  static forRoot(): DynamicModule {
    return {
      module: FooModule,
      providers: [FooDynamicService],
      exports: [FooDynamicService],
    };
  }
}

@Injectable()
class BarService {}

@Module({
  providers: [BarService],
  exports: [BarService],
})
class BarModule {}

@Module({
  providers: [
    {
      provide: 'quu',
      useValue: 42,
    },
  ],
  exports: ['quu'],
})
class QuuModule {}

@Module({
  imports: [ConditionalModule.registerWhen(QuuModule, 'QUU')],
  exports: [ConditionalModule],
})
class FooBarModule {}

describe('ConditionalModule', () => {
  it('it should work for a regular module', async () => {
    const modRef = await Test.createTestingModule({
      imports: [
        YmlConfigModule.forRoot({
          envFilePath: join(process.cwd(), 'tests', 'e2e', '.env.conditional'),
        }),
        ConditionalModule.registerWhen(FooModule, 'FOO'),
      ],
    }).compile();

    expect(modRef.get(FooService, { strict: false })).toBeDefined();

    await modRef.close();
  });

  it('should work for a dynamic module', async () => {
    const modRef = await Test.createTestingModule({
      imports: [
        YmlConfigModule.forRoot({
          envFilePath: join(process.cwd(), 'tests', 'e2e', '.env.conditional'),
        }),
        ConditionalModule.registerWhen(FooModule.forRoot(), 'FOO_DYNAMIC'),
      ],
    }).compile();

    expect(modRef.get(FooDynamicService, { strict: false })).toBeDefined();

    await modRef.close();
  });

  it('should not register when the value is false', async () => {
    const modRef = await Test.createTestingModule({
      imports: [
        YmlConfigModule.forRoot({
          envFilePath: join(process.cwd(), 'tests', 'e2e', '.env.conditional'),
        }),
        ConditionalModule.registerWhen(FooModule, 'FOO_FALSE'),
      ],
    }).compile();
    expect(() => modRef.get(FooService, { strict: false })).toThrow();
    await modRef.close();
  });

  it('should work for a custom condition', async () => {
    const modRef = await Test.createTestingModule({
      imports: [
        YmlConfigModule.forRoot({
          envFilePath: join(process.cwd(), 'tests', 'e2e', '.env.conditional'),
        }),
        ConditionalModule.registerWhen(FooModule, env => {
          return env.FOO_CUSTOM === 'yeah!';
        }),
      ],
    }).compile();
    expect(modRef.get(FooService, { strict: false })).toBeDefined();
    await modRef.close();
  });
});
