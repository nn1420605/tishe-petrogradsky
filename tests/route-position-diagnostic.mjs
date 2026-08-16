import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
globalThis.self=globalThis;
globalThis.importScripts=url=>vm.runInThisContext(fs.readFileSync(path.join(root,url),'utf8'),{filename:url});
let response=null;self.postMessage=value=>response=value;
vm.runInThisContext(fs.readFileSync(path.join(root,'route-worker.js'),'utf8'),{filename:'route-worker.js'});
const D=self.CH_DATA,lookup=new Map(D.nodes.map((p,i)=>[p[0].toFixed(7)+','+p[1].toFixed(7),i]));
function streetNodes(name){const out=[],seen=new Set();for(const way of D.ways)if(way.n===name)for(const p of way.p){const i=lookup.get(p[0].toFixed(7)+','+p[1].toFixed(7));if(i!=null&&!seen.has(i)){seen.add(i);out.push(i)}}return out}
const from=streetNodes('Чкаловский проспект'),to=streetNodes('Крестовский проспект'),start=from[Math.floor(from.length/2)],end=to[Math.floor(to.length/2)];
self.onmessage({data:{id:1,start,end,period:'day'}});
if(response?.error||!response?.variants?.[1])throw Error(response?.error||'Маршрут не построен');
const route=response.variants[1],xs=route.geometry.map(p=>p[0]),ys=route.geometry.map(p=>p[1]);
console.log(JSON.stringify({start:D.nodes[start],end:D.nodes[end],meters:route.meters,points:route.geometry.length,bbox:[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)]},null,2));
