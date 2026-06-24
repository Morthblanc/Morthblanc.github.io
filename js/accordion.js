// accordion: numbered sections open and close as they pass a trigger line while scrolling
(function(){
  const accs=[...document.querySelectorAll('.acc')];
  function setOpen(acc,open){ acc.classList.toggle('open',open); }
  // items inside these three sections reveal one by one as you scroll, instead of
  // all at once: each role, each selected work, each publication opens on its own.
  const items=[...document.querySelectorAll('#experience .xp, #research .proj, #publications .pub')];
  items.forEach(el=>{ el.classList.add('stagger'); el.classList.remove('reveal'); });
  // scroll-driven reveal: a section is open whenever its top has risen above a
  // trigger line low in the viewport, and closed again once it drops back below.
  // Both transitions happen near the bottom edge, so content above never jumps,
  // and the reveal replays on every downward / upward pass. Processed top to
  // bottom with live reads, so each open/close reflows before the next section
  // is measured and the cascade always resolves to the correct state. A plain
  // scroll handler (not IntersectionObserver) means fast scrolling or large
  // jumps can never skip a transition.
  const LINE=0.82;       // section trigger line (fraction of viewport height)
  const ITEM_LINE=0.9;   // per-item trigger line, a touch lower so items reveal as they enter
  let ticking=false;
  function update(){
    ticking=false;
    const line=window.innerHeight*LINE;
    for(const a of accs){                     // top to bottom
      const top=a.getBoundingClientRect().top; // reflects earlier writes this pass
      setOpen(a,top<line);
    }
    // per-item reveal (opacity/transform only, so no layout feedback to worry about);
    // gated on the parent section being open so items never reveal while collapsed
    const iline=window.innerHeight*ITEM_LINE;
    for(const el of items){
      const acc=el.closest('.acc');
      const show=!!acc&&acc.classList.contains('open')&&el.getBoundingClientRect().top<iline;
      el.classList.toggle('shown',show);
    }
  }
  function onScroll(){ if(!ticking){ ticking=true; requestAnimationFrame(update); } }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll);
  // when a section finishes opening/closing, re-evaluate items so they settle correctly
  document.querySelectorAll('.acc-body').forEach(b=>b.addEventListener('transitionend',onScroll));
  update();
})();
