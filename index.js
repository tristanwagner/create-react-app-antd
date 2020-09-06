#! /usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

const name = process.argv[2];
if (!name || name.match(/[<>:"\/\\|?*\x00-\x1F]/)) {
  return console.log(`
  Invalid directory name.
  Usage: create-react-app-antd name-of-app  
`);
}

const platform = /^win/.test(process.platform) ? 'win' : 'unix'

const repoURL = 'https://github.com/ant-design/create-react-app-antd.git';

const gitDir = `${name}${platform === 'win'? '\\' : '/'}.git`;

const commands = {
  git: ['git', ['clone', repoURL, name]],
  rm: platform === 'win' ? ['cmd', ['/c', 'rmdir', '/s', '/q', gitDir]] : ['rm', ['-rf', gitDir]],
  npm: [platform === 'win' ? 'npm.cmd' : 'npm', ['install']]
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
    return runCommand(...commands.npm, {
      cwd: process.cwd() + '/' + name
    });
  }).then(() => {
    console.log('Done! 🏁');
    console.log('');
    console.log('To get started:');
    console.log('cd', name);
    console.log('npm start');
  });

function runCommand(command, args, options = undefined) {
  const spawned = spawn(command, args, options);

  return new Promise((resolve) => {
    spawned.stdout.pipe(process.stdout)
    spawned.stderr.pipe(process.stderr)
    spawned.on('close', () => {
      resolve();
    });
  });
}
