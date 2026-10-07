import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {home,contact,about,privacy} from './public/views.js';
const root=fileURLToPath(new URL('./public/',import.meta.url));
const assets=new Map([['/views.js',['views.js','text/javascript']],['/app.js',['app.js','text/javascript']],['/style.css',['style.css','text/css']]]);
const pages=new Set(['/','/contact','/about','/privacy']);
export function contactDraft(input){
  const {name,email,topic,message}=input??{};
  if(typeof name!=='string'||!name.trim()||name.length>100||/[\r\n]/.test(name)) throw new Error('Please enter your name, using up to 100 characters.');
  if(typeof email!=='string'||email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||/[\r\n]/.test(email)) throw new Error('Please enter a valid email address.');
  if(!['A conversation','A document','Finding a time'].includes(topic)) throw new Error('Please choose what you need.');
  if(typeof message!=='string'||!message.trim()||message.length>5000) throw new Error('Please enter a message, using up to 5,000 characters.');
  const subject=`${topic} from ${name.trim()}`;
  const body=`From: ${name.trim()} <${email}>\n\n${message.trim()}`;
  return {url:`mailto:digestnews24@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`};
}
export const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  const path=new URL(req.url,'http://localhost').pathname;
  try{
    if(req.method==='GET'&&path==='/healthz'){res.setHeader('Content-Type','application/json');res.end('{"status":"ok"}');return;}
    if(req.method==='POST'&&path==='/api/contact-draft'){
      if(!req.headers['content-type']?.startsWith('application/json')){res.writeHead(415);res.end();return;}
      let body='';
      for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>20000){res.writeHead(413);res.end();return;}}
      try{const draft=contactDraft(JSON.parse(body));res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(draft));}
      catch(error){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:error instanceof SyntaxError?'Please check your message and try again.':error.message}));}
      return;
    }
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
    if(path==='/privacy.html'){res.writeHead(301,{Location:'/privacy'});res.end();return;}
    let file,type;
    if(pages.has(path)){file='index.html';type='text/html';}
    else if(assets.has(path)){[file,type]=assets.get(path);}
    else{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Page not found.');return;}
    let content=await readFile(root+file);
    if(type==='text/html'){const view=path==='/privacy'?privacy:path==='/contact'?contact:path==='/about'?about:home;content=Buffer.from(content.toString().replace('<main id="main"></main>','<main id="main">'+view+'</main>'));}
    res.setHeader('Content-Type',type+'; charset=utf-8');
    res.setHeader('Cache-Control',type==='text/html'?'no-cache':'public, max-age=3600');
    res.end(req.method==='HEAD'?undefined:content);
  }catch{res.writeHead(500,{'Content-Type':'text/plain'});res.end('Please try again shortly.');}
});
if(process.argv[1]===fileURLToPath(import.meta.url)) server.listen(Number(process.env.PORT||3000),process.env.HOST||'0.0.0.0',()=>console.log('stillsatdown server ready'));
