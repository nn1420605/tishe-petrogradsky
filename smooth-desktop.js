(()=>{
if(innerWidth<760)return;
let targetZoom=zoom,animation=0,anchorPoint=null,anchorScreen=null;
function beginZoom(next,x,y){targetZoom=Math.max(0,Math.min(5,next));anchorPoint=geo(x,y);anchorScreen={x,y};if(!animation)animation=requestAnimationFrame(step)}
function step(){const delta=targetZoom-zoom;if(Math.abs(delta)<.001){zoom=targetZoom;animation=0;requestRender();return}zoom+=delta*.24;const n=norm(anchorPoint),size=256*2**zoom;ox=anchorScreen.x-W/2-(n[0]-.5)*size;oy=anchorScreen.y-H/2-(n[1]-.5)*size;requestRender();animation=requestAnimationFrame(step)}
C.onwheel=e=>{e.preventDefault();const r=C.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,speed=e.deltaMode===1?.035:e.deltaMode===2?.25:.0016;beginZoom(targetZoom-e.deltaY*speed,x,y)};
document.querySelector('#plus').onclick=()=>beginZoom(targetZoom+.55,W/2,H/2);document.querySelector('#minus').onclick=()=>beginZoom(targetZoom-.55,W/2,H/2);
const layers=[baseLayer,noiseLayer,document.querySelector('#courtyards')].filter(Boolean),observer=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node instanceof HTMLImageElement){node.classList.add('tile-enter');requestAnimationFrame(()=>node.classList.add('tile-ready'))}});layers.forEach(layer=>observer.observe(layer,{childList:true}));
})();
