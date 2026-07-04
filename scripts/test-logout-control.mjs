import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dashboardShell = fs.readFileSync(path.join(root, 'src/components/DashboardShell.tsx'), 'utf8');
const agentWorkspace = fs.readFileSync(path.join(root, 'src/components/AgentWorkspace.tsx'), 'utf8');
const accountMenu = fs.readFileSync(path.join(root, 'src/components/AccountMenu.tsx'), 'utf8');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(
  dashboardShell.includes('<AccountMenu userEmail={userEmail} />'),
  'DashboardShell must render AccountMenu for authenticated dashboard users.'
);

assert(
  !dashboardShell.includes('isAdmin || isOrgAdmin ? (') && !dashboardShell.includes('{isAdmin || isOrgAdmin ?'),
  'DashboardShell AccountMenu must not be gated to admins/org admins; all authenticated users need logout.'
);

assert(
  !agentWorkspace.includes('<AccountMenu userEmail={userEmail}'),
  'AgentWorkspace should not render a second account menu once DashboardShell owns logout globally.'
);

assert(
  accountMenu.includes('auth.signOut()'),
  'AccountMenu must call the existing Supabase sign-out mechanism.'
);

assert(
  /try\s*{[\s\S]*auth\.signOut\(\)[\s\S]*}\s*catch(?:\s*\([^)]*\))?\s*{[\s\S]*}\s*finally\s*{[\s\S]*window\.location\.href\s*=\s*["']\/login["']/.test(accountMenu),
  'AccountMenu must catch sign-out failures and always redirect to /login without surfacing click-handler errors.'
);

console.log('Logout control checks passed.');
