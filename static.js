/* Static interactions. No WordPress, Elementor runtime, tracking or backend. */
document.querySelectorAll('.elementor-menu-toggle').forEach(button => {
 const menu = button.parentElement.querySelector('nav.elementor-nav-menu--dropdown');
 if (!menu) return;
 const toggle = () => {
  const open = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(open));button.classList.toggle('elementor-active',open);
  menu.classList.toggle('static-open',open);menu.setAttribute('aria-hidden',String(!open));
  menu.querySelectorAll('a').forEach(a=>a.tabIndex=open?0:-1);
 };
 button.addEventListener('click',toggle);
 button.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();toggle();}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&button.getAttribute('aria-expanded')==='true')toggle();});
});
document.querySelectorAll('.swiper').forEach(carousel=>{
 const widget=carousel.closest('[data-settings]');let settings={};try{settings=JSON.parse(widget?.dataset.settings||'{}')}catch{}
 const slides=carousel.querySelector('.swiper-wrapper');if(!slides)return;
 const update=()=>{const count=innerWidth<768?(settings.slides_to_show_mobile||2):innerWidth<1025?(settings.slides_to_show_tablet||3):(settings.slides_to_show||5);carousel.style.setProperty('--visible-slides',count);const gap=innerWidth<768?settings.image_spacing_custom_mobile?.size:innerWidth<1025?settings.image_spacing_custom_tablet?.size:innerWidth<=1600?settings.image_spacing_custom_laptop?.size:settings.image_spacing_custom?.size;carousel.style.setProperty('--slide-gap',(gap||0)+'px');};
 update();window.addEventListener('resize',update);
 carousel.querySelectorAll('.swiper-lazy-preloader').forEach(x=>x.remove());
 const next=()=>slides.scrollBy({left:slides.clientWidth/Number(getComputedStyle(carousel).getPropertyValue('--visible-slides')),behavior:'smooth'});
 const prev=()=>slides.scrollBy({left:-slides.clientWidth/Number(getComputedStyle(carousel).getPropertyValue('--visible-slides')),behavior:'smooth'});
 carousel.querySelector('.elementor-swiper-button-next')?.addEventListener('click',next);
 carousel.querySelector('.elementor-swiper-button-prev')?.addEventListener('click',prev);
});
document.querySelectorAll('.elementor-tab-title').forEach(title=>{
 title.addEventListener('click',()=>{const content=document.getElementById(title.getAttribute('aria-controls'));if(!content)return;const open=title.getAttribute('aria-expanded')!=='true';title.setAttribute('aria-expanded',String(open));title.classList.toggle('elementor-active',open);content.style.display=open?'block':'none';});
});
document.querySelectorAll('.back-history').forEach(a=>a.addEventListener('click',e=>{if(history.length>1){e.preventDefault();history.back();}}));
document.querySelectorAll('[data-static-contact]').forEach(form=>form.addEventListener('submit',e=>{
 e.preventDefault();if(!form.reportValidity())return;
 const fields=[...new FormData(form)].filter(([k,v])=>v&& !['post_id','form_id','referer_title','queried_id'].includes(k));
 const body=fields.map(([k,v])=>`${k.replace(/^form_fields\[|\]$/g,'')}: ${v}`).join('\n\n');
 location.href='mailto:hi@mantisnlp.com?subject='+encodeURIComponent('Mantis website enquiry')+'&body='+encodeURIComponent(body);
}));
const pagination = new Map();
document.querySelectorAll('.e-load-more-anchor').forEach(anchor=>{
 const widget=anchor.closest('.elementor-widget');const grid=widget?.querySelector('.elementor-loop-container');const control=widget?.querySelector('.e-loop__load-more');if(!grid)return;
 let next=Number(anchor.dataset.page)<Number(anchor.dataset.maxPage)?new URL(anchor.dataset.nextPage,location.href).href:null;let pending=null;
 const load=()=>{if(pending)return pending;if(!next)return Promise.resolve();const url=next;
 pending=(async()=>{control?.setAttribute('aria-busy','true');const response=await fetch(url);if(!response.ok)throw Error('Could not load more entries');const doc=new DOMParser().parseFromString(await response.text(),'text/html');const source=doc.querySelector('.elementor-loop-container');if(!source)throw Error('Missing entries');
 doc.querySelectorAll('link[rel=stylesheet]').forEach(link=>{const href=new URL(link.getAttribute('href'),url).href;if(![...document.styleSheets].some(s=>s.href===href)){const clone=link.cloneNode();clone.href=href;document.head.append(clone)}});
 source.querySelectorAll(':scope > .e-loop-item').forEach(card=>{card.querySelectorAll('[href],[src],[srcset]').forEach(el=>{for(const attr of ['href','src'])if(el.hasAttribute(attr))el.setAttribute(attr,new URL(el.getAttribute(attr),url).href);if(el.hasAttribute('srcset'))el.removeAttribute('srcset')});grid.append(card)});
 const following=doc.querySelector('.e-load-more-anchor');next=following&&Number(following.dataset.page)<Number(following.dataset.maxPage)?new URL(following.dataset.nextPage,url).href:null;if(!next&&control)control.hidden=true;
 })().finally(()=>{pending=null;control?.removeAttribute('aria-busy')});return pending;};
 const loadAll=async()=>{while(next)await load()};pagination.set(grid,loadAll);
 control?.querySelector('a')?.addEventListener('click',async e=>{e.preventDefault();try{await load()}catch{control.setAttribute('aria-label','Loading failed. Please try again.')}});
});
document.querySelectorAll('.e-filter').forEach(filter=>{
 const grid=document.querySelector('.elementor-loop-container.elementor-grid');if(!grid)return;
 filter.querySelectorAll('button[data-filter]').forEach(button=>button.addEventListener('click',async()=>{
  try{await pagination.get(grid)?.()}catch{return}
  const value=button.dataset.filter;const clear=button.getAttribute('aria-pressed')==='true'||value==='__all';
  filter.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(clear?b.dataset.filter==='__all':b===button)));
  grid.querySelectorAll(':scope > .e-loop-item').forEach(card=>{card.hidden=!clear&&!card.classList.contains('category-'+value)&&!card.classList.contains('competence-'+value)});
 }));
});
document.querySelectorAll('details.e-n-accordion-item').forEach(details=>details.addEventListener('toggle',()=>details.querySelector('summary').setAttribute('aria-expanded',String(details.open))));
document.querySelectorAll('.elementor-toc__body').forEach(toc=>{
 const article=document.querySelector('.elementor-widget-theme-post-content');if(!article){toc.replaceChildren();return;}
 const list=document.createElement('ul');list.className='elementor-toc__list-wrapper';
 article.querySelectorAll('h2,h3').forEach((heading,i)=>{heading.id ||= 'section-'+i;const li=document.createElement('li');li.className='elementor-toc__list-item';const a=document.createElement('a');a.className='elementor-toc__list-item-text';a.href='#'+heading.id;a.textContent=heading.textContent;li.append(a);list.append(li)});toc.replaceChildren(list);
});
document.querySelectorAll('.elementor-share-btn').forEach(button=>{
 const share=()=>{const url=encodeURIComponent(document.querySelector('link[rel=canonical]')?.href||location.href);const title=encodeURIComponent(document.title);let target;
 if(button.classList.contains('elementor-share-btn_linkedin'))target='https://www.linkedin.com/sharing/share-offsite/?url='+url;
 else if(button.classList.contains('elementor-share-btn_twitter'))target='https://twitter.com/intent/tweet?url='+url+'&text='+title;
 else if(button.classList.contains('elementor-share-btn_facebook'))target='https://www.facebook.com/sharer/sharer.php?u='+url;
 else if(button.classList.contains('elementor-share-btn_email')){location.href='mailto:?subject='+title+'&body='+url;return;}
 if(target)window.open(target,'_blank','noopener,noreferrer');};button.addEventListener('click',share);button.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();share()}});
});
