(() => {
 const dialog = document.getElementById('legacy-demo-notice');
 document.querySelectorAll('.material-symbols-outlined').forEach(icon => {
  if(icon.textContent.trim() === 'menu' && !icon.closest('button,a')){icon.setAttribute('role','button');icon.setAttribute('tabindex','0');icon.setAttribute('aria-label','Abrir menú de la demo');icon.addEventListener('click',()=>dialog.showModal());icon.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();dialog.showModal();}});}
 });
 document.addEventListener('click', event => {
  const target = event.target.closest('button,a[href="#"]');
  if (!target || target.closest('dialog')) return;
  event.preventDefault();
  const label=target.textContent.trim();
  const destinations=[['Inicio',null],['Servicios','Menú de Servicios'],['Galería','Antes y Después'],['Nuestro Proceso','Nuestro Proceso Elite']];
  const match=destinations.find(([text])=>label.includes(text));
  if(match){const heading=match[1]?[...document.querySelectorAll('h2,h3')].find(h=>h.textContent.trim()===match[1]):document.querySelector('main');if(heading){heading.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});return;}}
  dialog.showModal();
 });
 document.addEventListener('submit', event => {if(event.target.method !== 'dialog'){event.preventDefault();dialog.showModal();}});
 dialog.addEventListener('click', event => { if(event.target === dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
})();
