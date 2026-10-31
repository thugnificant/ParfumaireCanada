import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import * as cheerio from 'cheerio';
import sharp from 'sharp';


const stamp = new Date().toISOString();
const dirs = ['archive/pages', 'archive/api', 'archive/originals', 'src/data', 'public/images', 'docs/migration', 'source-data'];
for (const d of dirs) await fs.mkdir(d, { recursive: true });
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const records = []; const failures = []; const assetManifest = []; const assetCache = new Map();
const pause = ms => new Promise(r => setTimeout(r, ms));
async function fetchText(url, folder='pages') {
  const file = `archive/${folder}/${hash(url).slice(0,16)}.${url.includes('.json')||url.includes('wp-json')?'json':url.includes('sitemap')?'xml':'html'}`;
  try { return await fs.readFile(file, 'utf8'); } catch {}
  await pause(100);
  try {
    const body = execFileSync('curl', ['-fsSL','--max-time','45',url], {maxBuffer:30*1024*1024}).toString();
    await fs.writeFile(file, body); return body;
  } catch (e) { failures.push({url,reason:'Source request unavailable',detail:String(e.status)}); return null; }
}
async function getJSON(url) { const raw=await fetchText(url,'api');try{return JSON.parse(raw);}catch{return null;} }
function clean(html) {const $=cheerio.load(html??'');$('script,style,iframe,form,input,button,svg').remove();$('*').each((_,e)=>{for(const a of Object.keys(e.attribs??{}))if(!['href','src','alt'].includes(a))$(e).removeAttr(a);});return $('body').html()??'';}
function text(html) {return cheerio.load(html??'').text().replace(/\s+/g,' ').trim();}
async function imageAsset(url, association, alt='') {
  if (!url) return null;
  url=url.startsWith('//')?'https:'+url:url;
  if(assetCache.has(url)){const a=assetCache.get(url);a.associations.push(association);return a;}
  const ext=path.extname(new URL(url).pathname)||'.jpg';
  const id=hash(url).slice(0,16); const original=`archive/originals/${id}${ext}`;
  try {
    let buf;try{buf=await fs.readFile(original);}catch{await pause(70);buf=execFileSync('curl',['-fsSL','--max-time','45',url],{maxBuffer:45*1024*1024});await fs.writeFile(original,buf);}
    const checksum=hash(buf);let match=assetManifest.find(x=>x.checksum===checksum);
    if(match){match.associations.push(association);match.sourceUrls.push(url);assetCache.set(url,match);return match;}
    const meta=await sharp(buf).metadata();
    const base=`/images/${path.basename(new URL(url).pathname,ext).replace(/[^a-zA-Z0-9-]/g,'-').slice(0,55)}-${id.slice(0,6)}`;
    await sharp(buf).rotate().resize({width:1440,height:1440,fit:'inside',withoutEnlargement:true}).webp({quality:83}).toFile(`public${base}.webp`);
    await sharp(buf).rotate().resize({width:640,height:640,fit:'inside',withoutEnlargement:true}).webp({quality:79}).toFile(`public${base}-640.webp`);
    const a={id,sourceUrls:[url],original,path:base+'.webp',small:base+'-640.webp',width:meta.width,height:meta.height,checksum,alt,associations:[association],retrievedAt:stamp};
    assetManifest.push(a);assetCache.set(url,a);return a;
  }catch(e){failures.push({url,reason:'Asset download/optimization unavailable',detail:String(e).slice(0,160)});return null;}
}
const products=[];for(let page=1;;page++){const j=await getJSON(`https://shop.parfumaire.com/products.json?limit=250&page=${page}`);if(!j?.products)throw Error('Catalog request failed');if(!j.products.length)break;products.push(...j.products);}
await fs.writeFile('source-data/products.json',JSON.stringify({retrievedAt:stamp,source:'https://shop.parfumaire.com',currency:'USD',products},null,2));
const catalog=[];
for(const p of products){
 const images=[];for(const im of p.images){const a=await imageAsset(im.src,{type:'product',handle:p.handle,imageId:im.id,variantIds:im.variant_ids,position:im.position},im.alt||`${p.title} — view ${im.position}`);if(a)images.push({...a,alt:im.alt||`${p.title} — view ${im.position}`,sourceImageId:im.id,variantIds:im.variant_ids,position:im.position});}
 const $=cheerio.load(p.body_html);const paragraphs=$('p').map((_,e)=>$(e).text().trim()).get().filter(Boolean);
 const notes={};for(const line of paragraphs){const m=line.match(/^(TOP|MID|BASE)\s*:\s*(.*)/i);if(m)notes[m[1].toLowerCase()]=m[2].split('|').map(x=>x.trim());}
 const isDiffuser=p.product_type==='Diffuser';const flagged=[];
 if(/allergen|therapeutic/i.test(p.body_html))flagged.push('Unsupported health/performance wording retained in source archive; omitted from display.');
 if(['lemongrass','the-noir','air-mykonos','cuir-onyx','oud-charnel','sarona-market'].includes(p.handle))flagged.push('Source narrative and listed scent notes may differ. Confirm formulation before production.');
 let display=clean(p.body_html);const d=cheerio.load(display);d('p').each((_,e)=>{if(/allergen|therapeutic/i.test(d(e).text()))d(e).remove();});display=d('body').html()??'';
 catalog.push({id:String(p.id),handle:p.handle,title:p.title,vendor:p.vendor,sourceType:p.product_type,category:isDiffuser?'diffusers':'scents',tags:p.tags,options:p.options,sourceUrl:`https://shop.parfumaire.com/products/${p.handle}`,retrievedAt:stamp,sourceCurrency:'USD',approvedCanadianPricing:null,descriptionHtml:display,sourceDescriptionHtml:p.body_html,summary:paragraphs.find(x=>!/^TOP|^MID|^BASE|120ml fits|500ml|allergen|therapeutic|capacity|Dimensions/i.test(x))||p.title,notes,flags:flagged,images,variants:p.variants.map(v=>({id:String(v.id),title:v.title,sku:v.sku||null,options:[v.option1,v.option2,v.option3].filter(Boolean),priceMinor:Math.round(Number(v.price)*100),compareAtMinor:v.compare_at_price?Math.round(Number(v.compare_at_price)*100):null,sourceAvailable:v.available,featuredImageId:v.featured_image?.id??null,grams:v.grams,requiresShipping:v.requires_shipping}))});
 console.log(`Product ${catalog.length}/${products.length}: ${p.title}`);
}
await fs.writeFile('src/data/catalog.json',JSON.stringify(catalog,null,2));
// Enumerate XML sitemap leaves, including language versions and blog articles.
const discovered=new Set(['https://shop.parfumaire.com/','https://www.parfumaire.com/']); const maps=new Set();
async function sitemap(url){if(maps.has(url))return;maps.add(url);const raw=await fetchText(url);if(!raw)return;const $=cheerio.load(raw,{xml:true});if($('sitemapindex').length){for(const loc of $('sitemap > loc').map((_,e)=>$(e).text()).get())await sitemap(loc);}else for(const loc of $('url > loc').map((_,e)=>$(e).text()).get())discovered.add(loc);}
await sitemap('https://shop.parfumaire.com/sitemap.xml');await sitemap('https://www.parfumaire.com/wp-sitemap.xml');
const wp=[];for(const type of ['pages','posts'])for(let page=1;;page++){const j=await getJSON(`https://www.parfumaire.com/wp-json/wp/v2/${type}?per_page=100&page=${page}`);if(!Array.isArray(j)||!j.length)break;wp.push(...j);for(const p of j)discovered.add(p.link);if(j.length<100)break;}
await fs.writeFile('source-data/wp-content.json',JSON.stringify(wp,null,2));
const editorial=[]; const reviews=[]; const media=new Map();
for(const wpPage of wp){const raw=cheerio.load(wpPage.content.rendered).text();const urls=raw.match(/https?:[^\s"<>\[\]]+?\.(?:jpg|png|webp|mp4|pdf)/g)||[];for(const url of urls)media.set(url,{type:'business',source:wpPage.link});}
function internal(u,base){try{const x=new URL(u,base);if(!['shop.parfumaire.com','www.parfumaire.com','parfumaire.com'].includes(x.hostname))return null;if(/\.(?:js|css|png|jpg|svg|xml|json|woff|ttf)|\/wp-|\/cdn|\/feed|\/comments|\.well-known/.test(x.pathname))return null;if(x.search&&!x.searchParams.has('page'))return null;if(x.protocol!=='https:'&&x.protocol!=='http:')return null;x.protocol='https:';if(x.hostname==='parfumaire.com')x.hostname='www.parfumaire.com';x.hash='';return x.href;}catch{return null;}}
// Follow actual navigation/pagination. Exclude transaction endpoints and theme sample products explicitly.
for(const url of discovered){
 if(/\/cart|\/checkout|\/account|manage-my-subscriptions|products\/example-/.test(url)){records.push({source:url,type:'transaction',destination:null,status:'retired',reason:'Enquiry-only phase; no purchasing or account functions.'});continue;}
 const html=await fetchText(url);if(!html){records.push({source:url,destination:null,status:'inaccessible',reason:'Public source unavailable during import.'});continue;}
 const $=cheerio.load(html);$('script,style,noscript,svg').remove();
 $('a[href]').each((_,e)=>{const next=internal($(e).attr('href'),url);if(next)discovered.add(next);});
 const main=$('main').length?$('main').first():$('#main-content').length?$('#main-content'):$.root();
 const title=$('h1').first().text().trim()||$('title').text().split('|')[0].trim();
 const content=clean(main.html());
 const isWP=url.includes('www.parfumaire');
 if(isWP||/\/pages\/|\/blogs\//.test(url))editorial.push({sourceUrl:url,title,html:content,text:text(content),lang:/\/es(?:\/|$)/.test(url)?'es':'en'});
 $('.jdgm-rev').each((_,e)=>{const el=$(e);const body=el.find('.jdgm-rev__body').text().trim();if(body&&!reviews.some(r=>r.body===body))reviews.push({body,author:el.find('.jdgm-rev__author').text().trim(),title:el.find('.jdgm-rev__title').text().trim(),date:el.find('.jdgm-rev__timestamp').attr('data-content')||null,sourceUrl:url,context:'Original Parfumaire shop review; customer location not established.'});});
 if(isWP){const all=[...html.matchAll(/https?:[^\s"<>\[\]]+?\.(?:jpg|png|webp|mp4|pdf)/g)].map(x=>x[0]);for(const a of all)if(a.includes('/uploads/')&&!/-\d+x\d+\./.test(a))media.set(a,{type:'business',source:url});}
 records.push({source:url,title,type:/\/products\//.test(url)?'product':/\/collections\//.test(url)?'collection':isWP?'business':'page',language:/\/es(?:\/|$)/.test(url)?'es':'en',destination:null,status:'inventoried',reason:'Awaiting route reconciliation'});
 if(records.length%15===0)console.log(`Inventoried ${records.length} pages; discovered ${discovered.size}`);
 if(records.length>350)throw Error('Unexpected crawl expansion; inspect queue');
}
for(const [url,association] of media){if(/\.(?:mp4|pdf)$/.test(url)){assetManifest.push({sourceUrls:[url],associations:[association],status:'archived-reference',reason:'Video/document source retained; evaluate before publishing.'});continue;}await imageAsset(url,association);}
// Judge.me pagination uses an app-provided public token only; record discovery, never guess private credentials.

await fs.writeFile('source-data/editorial.json',JSON.stringify(editorial,null,2));
await fs.writeFile('src/data/reviews.json',JSON.stringify(reviews,null,2));
await fs.writeFile('docs/migration/source-inventory.json',JSON.stringify(records,null,2));
await fs.writeFile('docs/migration/assets.json',JSON.stringify(assetManifest,null,2));
await fs.writeFile('docs/migration/unavailable.json',JSON.stringify(failures,null,2));
await fs.writeFile('docs/migration/import-summary.json',JSON.stringify({retrievedAt:stamp,products:catalog.length,variants:catalog.reduce((n,p)=>n+p.variants.length,0),productImageReferences:catalog.reduce((n,p)=>n+p.images.length,0),assets:assetManifest.length,pages:records.length,reviews:reviews.length,sitemaps:[...maps],failures:failures.length},null,2));
console.log('Import finished', {products:catalog.length,pages:records.length,assets:assetManifest.length,reviews:reviews.length,failures:failures.length});
