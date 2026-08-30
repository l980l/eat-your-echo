import {mkdir, writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const required = [
  'ANDROID_KEYSTORE_BASE64',
  'ANDROID_KEY_ALIAS',
  'ANDROID_KEYSTORE_PASSWORD',
  'ANDROID_KEY_PASSWORD',
];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) throw new Error(`Missing required signing secret(s): ${missing.join(', ')}`);

const root = process.cwd();
const android = join(root, 'android');
const keyPath = join(android, 'app', 'upload-keystore.jks');
const propertiesPath = join(android, 'keystore.properties');
await mkdir(join(android, 'app'), {recursive: true});
await writeFile(keyPath, Buffer.from(process.env.ANDROID_KEYSTORE_BASE64, 'base64'), {mode: 0o600});
await writeFile(propertiesPath, [
  'storeFile=app/upload-keystore.jks',
  `storePassword=${process.env.ANDROID_KEYSTORE_PASSWORD}`,
  `keyAlias=${process.env.ANDROID_KEY_ALIAS}`,
  `keyPassword=${process.env.ANDROID_KEY_PASSWORD}`,
  '',
].join('\n'), {mode: 0o600});
console.log('Release signing configuration prepared.');
