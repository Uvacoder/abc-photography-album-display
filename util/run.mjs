import { spawn } from 'child_process';

export const run = (...args) =>
  new Promise((resolve, reject) => {
    const [cmd, ...rest] = args;
    const i = spawn(cmd, rest);

    let data = [];
    i.stdout.on('data', (d) => {
      data.push(d.toString());
    });

    let err = [];
    i.stderr.on('data', (data) => {
      err.push(data.toString());
    });

    i.on('close', (code) => {
      if (code === 0) return resolve(data.join('\n'));
      reject(err.join('\n'));
    });
  });
