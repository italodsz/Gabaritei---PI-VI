import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const raiz = fileURLToPath(new URL('../', import.meta.url));
const local = resolve(raiz, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
export const python = existsSync(local) ? local : process.platform === 'win32' ? 'python' : 'python3';
