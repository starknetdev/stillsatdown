import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {server,contactDraft} from './server.mjs';
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
after(()=>new Promise(resolve=>server.close(resolve)));
test('contact drafts preserve content as encoded text, and reject header injection',()=>{
 const draft=contactDraft({name:'A & B',email:'a@example.com',topic:'A document',message:'<script>alert(1)</script> & a quote'});
 assert.ok(draft.url.startsWith('mailto:digestnews24@gmail.com?'));
 assert.ok(draft.url.includes('%3Cscript%3E'));
 assert.throws(()=>contactDraft({name:'A\nBcc: x@example.com',email:'a@example.com',topic:'A document',message:'Hi'}));
});
test('only public routes are served, including clean and previous privacy URLs',async()=>{
 for(const path of ['/','/contact','/about','/privacy','/style.css','/app.js','/healthz'])assert.equal((await fetch(base+path)).status,200,path);
 for(const path of ['/.env','/server.mjs','/package.json','/.git/config','/api/queue.json','/dashboard'])assert.equal((await fetch(base+path)).status,404,path);
 assert.match(await (await fetch(base+'/privacy')).text(),/Limited Use requirements/);
 const old=await fetch(base+'/privacy.html',{redirect:'manual'});assert.equal(old.status,301);assert.equal(old.headers.get('location'),'/privacy');
});
test('draft endpoint validates content and never treats a prepared draft as sent',async()=>{
 const response=await fetch(base+'/api/contact-draft',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Visitor',email:'visitor@example.com',topic:'Finding a time',message:'Wednesday at 10?'})});
 assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');assert.ok((await response.json()).url.startsWith('mailto:'));
 assert.equal((await fetch(base+'/api/contact-draft',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,400);
 assert.equal((await fetch(base+'/api/contact-draft',{method:'POST',body:'not json'})).status,415);
 assert.equal((await fetch(base+'/api/contact-draft',{method:'POST',headers:{'Content-Type':'application/json'},body:'x'.repeat(20001)})).status,413);
});
