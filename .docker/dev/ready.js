#!node

const { existsSync } = require('fs');

function check() {
    if (existsSync('/code/package.json') && existsSync('/code/pnpm-lock.yaml')) {
        process.exit(0);
    } else {
        setTimeout(() => {
            check();
        }, 40)
    }
}

check();
