import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
globalThis.window=globalThis;
vm.runInThisContext(fs.readFileSync(path.join(root,'map-content.js'),'utf8'));
const D=globalThis.CH_DATA;
const lookup=new Map(D.nodes.map((p,i)=>[p[0].toFixed(7)+','+p[1].toFixed(7),i]));
const edgeByPair=new Map();
for(const e of D.edges){edgeByPair.set(`${e[0]},${e[1]}`,e);edgeByPair.set(`${e[1]},${e[0]}`,e)}
const baseAdj=Array.from({length:D.nodes.length},()=>[]);for(const e of D.edges){baseAdj[e[0]].push(e[1]);baseAdj[e[1]].push(e[0])}
const component=new Int32Array(D.nodes.length);component.fill(-1);const sizes=[];let cid=0;for(let i=0;i<D.nodes.length;i++)if(component[i]<0){const queue=[i];component[i]=cid;for(let h=0;h<queue.length;h++)for(const v of baseAdj[queue[h]])if(component[v]<0){component[v]=cid;queue.push(v)}sizes.push(queue.length);cid++}const mainComp=sizes.indexOf(Math.max(...sizes));
const [minX,minY,maxX,maxY]=D.bounds,cos=Math.cos((minY+maxY)/2*Math.PI/180);

function nearest(p){let best=0,bd=Infinity;for(let i=0;i<D.nodes.length;i++){if(component[i]!==mainComp)continue;const dx=(D.nodes[i][0]-p[0])*cos,dy=D.nodes[i][1]-p[1],d=dx*dx+dy*dy;if(d<bd){bd=d;best=i}}return best}
function streetNodes(name){const nodes=[],seen=new Set();for(const w of D.ways)if(w.n===name)for(const p of w.p){const i=lookup.get(p[0].toFixed(7)+','+p[1].toFixed(7));if(i!=null&&component[i]===mainComp&&!seen.has(i)){seen.add(i);nodes.push(i)}}return nodes}
function streetNode(name){const nodes=streetNodes(name);if(nodes.length)return nodes[nodes.length>>1];const way=D.ways.find(w=>w.n===name);return way?nearest(way.p[way.p.length>>1]):null}
function route(blocked=new Set()){const adj=Array.from({length:D.nodes.length},()=>[]);for(const e of D.edges)if(!blocked.has(e[4])){adj[e[0]].push([e[1],e]);adj[e[1]].push([e[0],e])}const from=streetNodes('Чкаловский проспект'),to=streetNodes('Крестовский проспект'),starts=from.length?from:[streetNode('Чкаловский проспект')],targets=new Set(to.length?to:[streetNode('Крестовский проспект')]),dist=new Float64Array(D.nodes.length),prev=new Int32Array(D.nodes.length);dist.fill(Infinity);prev.fill(-1);const queue=[];for(const s of starts){dist[s]=0;prev[s]=-2;queue.push(s)}let reached=-1;while(queue.length){let best=0;for(let i=1;i<queue.length;i++)if(dist[queue[i]]<dist[queue[best]])best=i;const u=queue.splice(best,1)[0];if(targets.has(u)){reached=u;break}for(const[v,e]of adj[u]){const nd=dist[u]+e[2]*Math.max(.38,1+e[3]/100*.85);if(nd<dist[v]){dist[v]=nd;prev[v]=u;if(!queue.includes(v))queue.push(v)}}}const path=[];for(let u=reached;u>=0;u=prev[u]){path.push(u);if(prev[u]===-2)break}path.reverse();const edges=path.slice(1).map((v,i)=>edgeByPair.get(`${path[i]},${v}`)),meters=edges.reduce((sum,e)=>sum+(e?.[2]||0),0);return{path,edges,meters,start:D.nodes[path[0]],end:D.nodes[path.at(-1)]}}

const safe=route(new Set([1296100964])),fromNodes=streetNodes('Чкаловский проспект'),toNodes=streetNodes('Крестовский проспект');
console.log(JSON.stringify({meters:Math.round(safe.meters),blocked:safe.edges.filter(e=>e?.[4]===1296100964).length,start:safe.start,end:safe.end,fromNodes:fromNodes.length,toNodes:toNodes.length},null,2));
if(!safe.path.length||safe.meters<=0)throw Error('Резервный маршрут не построен');
if(safe.edges.some(e=>e?.[4]===1296100964))throw Error('Резервный маршрут использует ошибочный переход через воду');
if(fromNodes.length<2||toNodes.length<2)throw Error('Резервный выбор улицы использует один случайный фрагмент вместо всей улицы');
