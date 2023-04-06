import { writeFile } from 'fs/promises';
// import chalk from 'chalk'


console.log(process.stdout.isTTY)

setInterval(() => {
    console.log("heya2", new Date(), 3);
}, 1000);

writeFile('timestamp.txt', process.cwd() + ' - ' + new Date().toString());

console.log(process.env)