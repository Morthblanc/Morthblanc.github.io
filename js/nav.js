// mobile nav toggle
(function(){
  const btn=document.getElementById('menubtn');
  const menu=document.getElementById('navmenu');
  if(btn&&menu){
    btn.addEventListener('click',()=>{
      const open=menu.classList.toggle('open');
      btn.setAttribute('aria-expanded',open);
      btn.textContent=open?'✕':'☰';
    });
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      menu.classList.remove('open');btn.setAttribute('aria-expanded','false');btn.textContent='☰';
    }));
  }
  // email obfuscation: no plaintext address in source, decoded on load
  const u=atob('aC5lcmVuLm9idXo='), d=atob('Z21haWwuY29t');
  const addr=u+String.fromCharCode(64)+d;
  document.querySelectorAll('.js-mail').forEach(a=>{
    a.setAttribute('href','mailto:'+addr);
    if(a.classList.contains('js-mail-text')) a.textContent=addr;
  });
})();

