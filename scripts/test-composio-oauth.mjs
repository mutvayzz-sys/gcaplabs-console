import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = readFileSync(join(process.cwd(), 'src/components/integrations/ComposioApps.tsx'), 'utf8');
const failures = [];

if (/window\.location\.href\s*=\s*redirectUrl/.test(source)) {
  failures.push('Composio OAuth must not replace the console tab with window.location.href.');
}

if (!/window\.open\(/.test(source)) {
  failures.push('Composio OAuth should open in a popup/new window.');
}

if (!/postMessage/.test(source) || !/addEventListener\('message'/.test(source)) {
  failures.push('OAuth popup return must notify the opener with postMessage.');
}

if (!/connected_account_id/.test(source) || !/oauth_error/.test(source)) {
  failures.push('OAuth callback handling must cover success and error/cancel query params.');
}

if (!/popup\.closed/.test(source)) {
  failures.push('Main window must recover when the OAuth popup is closed/canceled.');
}

if (failures.length) {
  console.error('Composio OAuth popup regression failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Composio OAuth popup regression passed.');
