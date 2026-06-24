function animate(el){
  const to=+el.dataset.to, suf=el.dataset.suffix||'';
  const dur=1400, t0=performance.now();
  function step(t){const p=Math.min((t-t0)/dur,1);const e=1-Math.pow(1-p,3);
    el.textContent=Math.round(to*e)+suf;if(p<1)requestAnimationFrame(step);}
  requestAnimationFrame(step);
}
const statObs=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){animate(e.target);statObs.unobserve(e.target);}});},{threshold:.5});
document.querySelectorAll('.stat .v').forEach(el=>statObs.observe(el));
const revObs=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');revObs.unobserve(e.target);}});},{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));
if(matchMedia('(prefers-reduced-motion: reduce)').matches){document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in'));}
