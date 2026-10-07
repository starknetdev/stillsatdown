import {home,contact,about,privacy} from '/views.js';
const main=document.querySelector('main');



function render(){
 const path=location.pathname;
 main.innerHTML=path==='/privacy'?privacy:path==='/contact'?contact:path==='/about'?about:home;
 const titles={'/':'stillsatdown | A little room to get things done','/contact':'Get in touch | stillsatdown','/about':'About | stillsatdown','/privacy':'Privacy policy | stillsatdown'};document.title=titles[path]||titles['/'];
 document.querySelectorAll('[data-nav]').forEach(a=>{a.removeAttribute('aria-current');if(a.dataset.nav===path)a.setAttribute('aria-current','page');});
 if(path==='/contact'){
  const form=document.querySelector('form');const topic=new URLSearchParams(location.search).get('topic');form.elements.topic.value=topic==='document'?'A document':topic==='scheduling'?'Finding a time':'A conversation';
  form.addEventListener('submit',async event=>{event.preventDefault();const status=document.querySelector('.form-status');const button=form.querySelector('button');button.disabled=true;status.textContent='Preparing your email…';
   try{const response=await fetch('/api/contact-draft',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});const data=await response.json();if(!response.ok)throw new Error(data.error);const link=document.createElement('a');link.href=data.url;link.textContent='Open your email app to review and send ↗';status.replaceChildren(link);link.click();}
   catch(error){status.textContent=error.message||'We couldn’t prepare your message. Please use the email link instead.';}
   finally{button.disabled=false;}
  });
 }
}

document.addEventListener('click',event=>{const link=event.target.closest('a');if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;const url=new URL(link.href);if(url.origin!==location.origin||!['/','/about','/contact','/privacy'].includes(url.pathname))return;event.preventDefault();history.pushState({},'',url);render();window.scrollTo(0,0);main.setAttribute('tabindex','-1');main.focus({preventScroll:true});});
window.addEventListener('popstate',()=>{render();window.scrollTo(0,0);});render();
