import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=join(fileURLToPath(new URL('../',import.meta.url)),'dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
const port=Number(process.env.PORT||4173);
createServer((req,res)=>{let path=normalize(join(root,new URL(req.url,'http://localhost').pathname.replace(/^\//,'')||'index.html'));if(!path.startsWith(root)){res.writeHead(403);res.end();return;}try{if(statSync(path).isDirectory())path=join(path,'index.html');const s=statSync(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Content-Length':s.size});createReadStream(path).pipe(res);}catch{res.writeHead(404);res.end('Not found');}}).listen(port,'0.0.0.0',()=>console.log(`Preview at http://localhost:${port}`));
