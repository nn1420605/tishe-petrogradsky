const VERSION='tishe-mobile-v10-three-routes';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','./map-content.js','./tile-meta.json','./compare-routes.css','./compare-routes.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const isPage=event.request.mode==='navigate';
  event.respondWith((isPage?fetch(event.request).then(response=>{if(response.ok)caches.open(VERSION).then(c=>c.put('./index.html',response.clone()));return response}).catch(()=>caches.match('./index.html')):caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(VERSION).then(c=>c.put(event.request,copy))}return response}))));
});
self.addEventListener('message',event=>{
  if(event.data?.type!=='CACHE_ALL')return;
  const urls=event.data.urls||[];
  event.waitUntil(caches.open(VERSION).then(async cache=>{let done=0;for(const url of urls){try{await cache.add(url)}catch{}done++;if(done%25===0)event.source?.postMessage({type:'CACHE_PROGRESS',done,total:urls.length})}event.source?.postMessage({type:'CACHE_DONE',total:urls.length})}));
});
