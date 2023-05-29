
const { spawn } = require('child_process');

const startServerScript = () => {
  const child = spawn('node', ['./src/Server/server-script.js']);

  child.stdout.on('data', (data) => {
    console.log(`Server output: ${data}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`Server error: ${data}`);
  });

  child.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
};

startServerScript();