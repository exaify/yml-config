import type { UserConfig } from '@commitlint/types';

const configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-case': [
      2,
      'always',
      [
        'lower-case',
        'sentence-case',
        'start-case',
        'pascal-case',
        'snake-case',
        'upper-case',
        'kebab-case',
      ],
    ],
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
    'subject-empty': [2, 'never'],
  },
};
export default configuration;
