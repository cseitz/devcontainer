import { FSWatcher, watch } from 'chokidar';
import { readFile } from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { exec as _exec } from 'child_process';
import Bottleneck from 'bottleneck';
import QuickLRU from 'quick-lru';


const __volume = '/data/code';
const __local = '/code';


const lru = new QuickLRU({
    maxSize: 1000
});

const limiter = new Bottleneck({
    maxConcurrent: 1,
})

let ignores: string[] = [];

async function exec(cmd: string) {
    await limiter.schedule(async () => {
        new Promise(resolve => {
            const proc = _exec(cmd, () => resolve(true));
            proc?.stdout?.pipe(process.stdout);
            proc?.stderr?.pipe(process.stderr);
        })
    })
}

async function rsync() {
    const excludes = ignores.map(o => `--exclude "${o}"`);
    await exec(`rsync -av ${excludes} ${__volume} ${__local}`);
}

async function updateIgnores() {
    const isFirst = ignores.length === 0;
    const before = JSON.stringify(ignores);
    ignores = (
        await readFile(`${__local}/.dockerignore`, 'utf8')
    ).split(/\r?\n/);
    return !isFirst || (
        before === JSON.stringify(ignores)
    );
}



const watchers: {
    incoming?: FSWatcher
    outgoing?: FSWatcher
} = {};

let first = true;
let _empty;

async function run() {
    await updateIgnores();

    watchers.incoming?.close();
    watchers.incoming = watch(__volume, {
        ignorePermissionErrors: true,
        ignored: ignores,
    });

    watchers.outgoing?.close();
    watchers.outgoing = watch(__local, {
        ignorePermissionErrors: true,
        ignored: ignores,
    });

    watchers.incoming.on('change', (action, path: string) => {
        if (path.endsWith('.dockerignore')) run();
    })

    watchers.incoming.on('all', (action, path: string) => {
        const __dest = `${__local}${path.slice(__volume.length)}`;
        if (_empty) clearTimeout(_empty);
        rsync().then(() => {
            lru.set(__dest, true);
            _empty = setTimeout(() => {
                console.log("clearing");
                lru.clear();
            }, 100)
            if (first || path.endsWith('pnpm-lock.yaml')) {
                first = false;
                console.log('installing...')
                exec(`cd ${__local} && pnpm i`);
            }
        })
    })

    watchers.outgoing.on('all', (action, path: string) => {
        rsync();
        if (action === 'change' && !lru.has(path)) {
            createReadStream(path).pipe(
                createWriteStream(`${__volume}${path.slice(__local.length)}`)
            )
        }
    })
}


await run();
