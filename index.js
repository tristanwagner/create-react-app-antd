#! /usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

const args = process.argv.slice(2);

const helpMessage = `
  Usage: create-react-app-antd <options> <app-name>

  Options
  -y|--y|-yank|--yank     Use yarn instead of npm.
  -h|-help|--h|--help     Display this message.`;

if (args.find(arg => arg.match(/^(-|--)(h|help)$/))) {
  return console.log(helpMessage);
}

const yarnIndex = args.findIndex(arg => arg.match(/^(-|--)(y|yarn)$/));
let yarnFlag = false;

if (yarnIndex >= 0) {
  args.splice(yarnFlag, 1);
  yarnFlag = true;
}

const name = args[0];

if (!name || name.match(/[<>:"\/\\|?*\x00-\x1F]/) || fs.existsSync(name)) {
  return console.log(`
  Invalid or already existing directory name.
  ${helpMessage}
  `);
}

const platform = /^win/.test(process.platform) ? 'win' : 'unix';

const repoURL = 'https://github.com/ant-design/create-react-app-antd.git';

const gitDir = `${name}${platform === 'win'? '\\' : '/'}.git`;

const commands = {
  git: ['git', ['clone', repoURL, name]],
  rm: platform === 'win' ? ['cmd', ['/c', 'rmdir', '/s', '/q', gitDir]] : ['rm', ['-rf', gitDir]],
  npm: [platform === 'win' ? 'npm.cmd' : 'npm', ['install']],
  yarn: [platform === 'win' ? 'yarn.cmd' : 'yarn', ['install']]
};

runCommand(...commands.git)
  .then(() => {
    if (fs.existsSync(gitDir)) {
      return runCommand(...commands.rm);
    } else {
      return Promise.resolve();
    }
  }).then(() => {
    console.log('Installing dependencies...');
    return runCommand(...commands[yarnFlag ? 'yarn' : 'npm'], {
      cwd: process.cwd() + '/' + name
    });
  }).then(() => {
    console.log('Done! 🏁');
    console.log('');
    console.log('To get started:');
    console.log('cd', name);
    console.log(yarnFlag ? 'yarn start' : 'npm start');
  });

function runCommand(command, args, options = undefined) {
  const spawned = spawn(command, args, options);

  return new Promise((resolve) => {
    spawned.stdout.pipe(process.stdout);
    spawned.stderr.pipe(process.stderr);
    spawned.on('close', () => {
      resolve();
    });
  });
}
