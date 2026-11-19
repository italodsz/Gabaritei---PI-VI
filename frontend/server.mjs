// Compatibilidade com npm start e npm run dev.
import { spawn } from 'node:child_process';
import { python, raiz } from './python.mjs';

const servidor = spawn(python, ['-m', 'backend'], { cwd: raiz, stdio: 'inherit' });
for (const sinal of ['SIGINT', 'SIGTERM']) process.on(sinal, () => servidor.kill(sinal));
servidor.on('error', erro => {
  console.error(`Não foi possível iniciar o Python: ${erro.message}`);
  process.exitCode = 1;
});
servidor.on('exit', (codigo, sinal) => {
  process.exitCode = codigo ?? (sinal === 'SIGINT' ? 130 : 143);
});
