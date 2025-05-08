import { execSync } from 'child_process';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

async function main() {
  // const { default: pkg } = await import('../package.json', {
  //   assert: {
  //     type: 'json',
  //   },
  // });
  const pkg = await require('../package.json');
  console.log(pkg);

  const commandAdd = `git add .`;
  const commandCommit = `git commit -am "chore(): release v${pkg.version}"`;
  try {
    await execSync(commandAdd, { stdio: 'inherit' });
    await execSync(commandCommit, { stdio: 'inherit' });
  } catch (ex) {
    globalThis.console.error(ex);
  }
}

main();
