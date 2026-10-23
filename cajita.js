(function(){
  function init(){
    Array.prototype.forEach.call(document.querySelectorAll('.audio-inner'),function(root){
      var audio=root.querySelector('audio');
      if(!audio)return;
      var button=root.querySelector('[data-audio-toggle]');
      var icon=root.querySelector('[data-audio-icon]');
      var bar=root.querySelector('[data-audio-bar]');
      var fill=bar?bar.querySelector('i'):null;
      var time=root.querySelector('[data-audio-time]');
      function fmt(value){
        if(!isFinite(value))return '0:00';
        var total=Math.max(0,Math.floor(value));
        return Math.floor(total/60)+':'+String(total%60).padStart(2,'0');
      }
      function draw(){
        var duration=audio.duration||0;
        var percent=duration?Math.min(100,(audio.currentTime/duration)*100):0;
        if(fill)fill.style.width=percent+'%';
        if(time)time.textContent=fmt(audio.currentTime)+' / '+fmt(duration);
        if(button)button.setAttribute('aria-label',audio.paused?'reproducir audio':'pausar audio');
        if(icon)icon.textContent=audio.paused?'▶':'❚❚';
      }
      function toggle(event){
        event.preventDefault();
        if(audio.paused)audio.play().catch(function(){});
        else audio.pause();
      }
      if(button)button.addEventListener('click',toggle);
      audio.addEventListener('play',draw);
      audio.addEventListener('pause',draw);
      audio.addEventListener('timeupdate',draw);
      audio.addEventListener('loadedmetadata',draw);
      audio.addEventListener('ended',draw);
      if(bar)bar.addEventListener('click',function(event){
        if(!audio.duration)return;
        var rect=bar.getBoundingClientRect();
        audio.currentTime=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width))*audio.duration;
      });
      draw();
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
