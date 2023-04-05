/**
 * Updates `pnpm-workspace.yaml` with values populated from `package.json`
 */
const { readFileSync, writeFileSync } = require('fs');
const { EOL } = require('os');
const __repo = __dirname + '/..';


const pkg = JSON.parse(readFileSync(__repo + '/package.json', 'utf8'));

const lines = [];
const i = (t) => {
    lines.push(t[0])
};

i `packages:`
for (const workspace of pkg.workspaces || []) {
    i([`  - '${workspace}'`])
}

writeFileSync(__repo + '/pnpm-workspace.yaml', lines.join(EOL));