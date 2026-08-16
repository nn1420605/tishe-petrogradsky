(()=>{
if(innerWidth<760)return;
let targetZoom=zoom,animation=0,anchorPoint=null,anchorScreen=null;
function applyZoom(next){zoom=next;const n=norm(anchorPoint),size=256*2**zoom;ox=anchorScreen.x-W/2-(n[0]-.5)*size;oy=anchorScreen.y-H/2-(n[1]-.5)*size}
function beginZoom(delta,x,y){if(!animation)targetZoom=zoom;targetZoom=Math.max(0,Math.min(5,targetZoom+delta));anchorPoint=geo(x,y);anchorScreen={x,y};if(!animation)animation=requestAnimationFrame(step)}
function step(){const delta=targetZoom-zoom;if(Math.abs(delta)<.001){applyZoom(targetZoom);animation=0;requestRender();return}applyZoom(zoom+delta*.24);requestRender();animation=requestAnimationFrame(step)}
C.onwheel=e=>{e.preventDefault();const r=C.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,speed=e.deltaMode===1?.035:e.deltaMode===2?.25:.0016;beginZoom(-e.deltaY*speed,x,y)};
document.querySelector('#plus').onclick=()=>beginZoom(.55,W/2,H/2);document.querySelector('#minus').onclick=()=>beginZoom(-.55,W/2,H/2);
const layers=[baseLayer,noiseLayer,document.querySelector('#courtyards')].filter(Boolean),observer=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node instanceof HTMLImageElement){node.classList.add('tile-enter');requestAnimationFrame(()=>node.classList.add('tile-ready'))}});layers.forEach(layer=>observer.observe(layer,{childList:true}));
})();
