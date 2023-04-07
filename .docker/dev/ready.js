#!node

const { existsSync } = require('fs');

function check() {
    if (existsSync('/code/package.json') && existsSync('/code/pnpm-lock.yaml') && existsSync('/code/node_modules/.bin/turbo')) {
        process.exit(0);
    } else {
        setTimeout(() => {
            check();
        }, 40)
    }
}

check();
