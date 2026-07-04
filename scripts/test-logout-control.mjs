import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dashboardLayout = fs.readFileSync(path.join(root, 'src/app/dashboard/layout.tsx'), 'utf8');
const agentWorkspacePage = fs.readFileSync(path.join(root, 'src/app/dashboard/agents/[agentId]/[[...tab]]/page.tsx'), 'utf8');
const agentWorkspace = fs.readFileSync(path.join(root, 'src/components/AgentWorkspace.tsx'), 'utf8');
const accountMenu = fs.readFileSync(path.join(root, 'src/components/AccountMenu.tsx'), 'utf8');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(
  dashboardLayout.includes('if (!user) redirect("/login")'),
  'Dashboard layout must keep unauthenticated users out of protected dashboard routes.'
);

assert(
  agentWorkspacePage.includes('userEmail={user?.email ?? null}') && agentWorkspace.includes('<AccountMenu userEmail={userEmail}'),
  'Authenticated agent-workspace users must receive an AccountMenu with logout.'
);

assert(
  !agentWorkspace.includes('isAdmin || isOrgAdmin ? (') && !agentWorkspace.includes('{isAdmin || isOrgAdmin ?'),
  'AgentWorkspace AccountMenu must not be gated to admins/org admins; all authenticated users need logout.'
);

assert(
  !agentWorkspace.includes('<AccountMenu userEmail={userEmail} caption=\'\' />') ||
    agentWorkspace.match(/<AccountMenu userEmail={userEmail}/g)?.length === 1,
  'AgentWorkspace should render exactly one account menu in its single protected workspace shell.'
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
