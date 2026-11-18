import {cp,mkdir,access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const destination=process.argv[2];
if(!destination||!path.isAbsolute(destination))throw new Error('Provide a new absolute destination directory.');
const source=fileURLToPath(new URL('../assets/approved-card/',import.meta.url));
try{await access(destination);throw new Error('Destination already exists; no files were changed.')}catch(e){if(e.code!=='ENOENT')throw e}
await mkdir(path.dirname(destination),{recursive:true});
await cp(source,destination,{recursive:true,errorOnExist:true,force:false});
console.log(`Copied approved reference to ${destination}\nServe this folder over HTTP and open game.html. Character-specific rig coordinates still require adaptation.`);
