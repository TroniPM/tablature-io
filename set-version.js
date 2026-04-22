import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const version = pkg.version;
const hash = process.env.GIT_HASH || '';

const versionString = hash ? `${version}-${hash}` : version;

const filePath = path.join(__dirname, 'src', 'components', 'FooterBar.vue');
let content = fs.readFileSync(filePath, 'utf8');
content = content.replace('__VERSION__', versionString);
fs.writeFileSync(filePath, content, 'utf8');

console.log(`Version set to: v${versionString}`);
