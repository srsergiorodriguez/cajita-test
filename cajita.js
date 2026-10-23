(function(){
  function init(){
    var stage=document.querySelector('.stage');
    if(!stage)return;
    var body=document.body;
    var storageKey='cajita-fichas:'+(body.getAttribute('data-ficha-project')||'local')+':'+(body.getAttribute('data-ficha-page')||'page');
    var stored={};
    try{stored=JSON.parse(localStorage.getItem(storageKey)||'{}')||{};}catch(err){stored={};}
    var items=[];
    var authored={};
    var positions={};
    function setPosition(el,id,x,y){
      var sw=stage.clientWidth,sh=stage.clientHeight;
      var px=parseFloat(x),py=parseFloat(y);
      if(!isFinite(px)||!isFinite(py))return;
      var left=Math.max(0,Math.min(sw-el.offsetWidth,px/100*sw));
      var top=Math.max(0,Math.min(sh-el.offsetHeight,py/100*sh));
      var nx=(left/sw*100)+'%',ny=(top/sh*100)+'%';
      el.style.setProperty('--x',nx);
      el.style.setProperty('--y',ny);
      positions[id]={x:nx,y:ny};
    }
    function persist(){
      try{localStorage.setItem(storageKey,JSON.stringify(positions));}catch(err){}
    }
    function restoreAll(){
      items.forEach(function(item){
        var a=authored[item.id];
        if(!a)return;
        if(a.x)item.el.style.setProperty('--x',a.x);
        if(a.y)item.el.style.setProperty('--y',a.y);
      });
      positions={};
      try{localStorage.removeItem(storageKey);}catch(err){}
    }
    Array.prototype.forEach.call(stage.querySelectorAll('details.el-ficha'),function(el){
      var id=el.getAttribute('data-ficha-element')||el.getAttribute('data-ficha-id')||'';
      if(!id)return;
      authored[id]={x:el.style.getPropertyValue('--x'),y:el.style.getPropertyValue('--y')};
      items.push({el:el,id:id});
      if(stored[id])setPosition(el,id,stored[id].x,stored[id].y);
      var summary=el.querySelector('summary');
      if(!summary)return;
      summary.tabIndex=0;
      summary.addEventListener('dragstart',function(e){e.preventDefault();});
      var drag=null,moved=false,suppress=false;
      summary.addEventListener('pointerdown',function(e){
        if(e.button!==0)return;
        drag={x:e.clientX,y:e.clientY,left:el.offsetLeft,top:el.offsetTop,id:e.pointerId};
        moved=false;
        try{summary.setPointerCapture(e.pointerId);}catch(err){}
      });
      summary.addEventListener('pointermove',function(e){
        if(!drag||drag.id!==e.pointerId)return;
        var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
        if(!moved&&Math.sqrt(dx*dx+dy*dy)<6)return;
        moved=true;
        e.preventDefault();
        var sw=stage.clientWidth,sh=stage.clientHeight;
        var left=Math.max(0,Math.min(sw-el.offsetWidth,drag.left+dx));
        var top=Math.max(0,Math.min(sh-el.offsetHeight,drag.top+dy));
        el.style.setProperty('--x',(left/sw*100)+'%');
        el.style.setProperty('--y',(top/sh*100)+'%');
        positions[id]={x:el.style.getPropertyValue('--x'),y:el.style.getPropertyValue('--y')};
      });
      function end(){
        if(!drag)return;
        if(moved){suppress=true;persist();setTimeout(function(){suppress=false;},0);}
        drag=null;
      }
      summary.addEventListener('pointerup',end);
      summary.addEventListener('pointercancel',end);
      summary.addEventListener('click',function(e){
        if(suppress){e.preventDefault();e.stopPropagation();suppress=false;}
      },true);
      summary.addEventListener('keydown',function(e){
        var step=e.shiftKey?25:5,dx=0,dy=0;
        if(e.key==='ArrowLeft')dx=-step;
        else if(e.key==='ArrowRight')dx=step;
        else if(e.key==='ArrowUp')dy=-step;
        else if(e.key==='ArrowDown')dy=step;
        else return;
        e.preventDefault();
        e.stopPropagation();
        var sw=stage.clientWidth,sh=stage.clientHeight;
        var left=Math.max(0,Math.min(sw-el.offsetWidth,el.offsetLeft+dx));
        var top=Math.max(0,Math.min(sh-el.offsetHeight,el.offsetTop+dy));
        el.style.setProperty('--x',(left/sw*100)+'%');
        el.style.setProperty('--y',(top/sh*100)+'%');
        positions[id]={x:el.style.getPropertyValue('--x'),y:el.style.getPropertyValue('--y')};
        persist();
      });
      el.classList.add('is-movable');
    });
    var reset=stage.querySelector('[data-ficha-reset]');
    if(reset)reset.addEventListener('click',restoreAll);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
