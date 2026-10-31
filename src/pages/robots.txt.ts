import {site} from '../data/site.mjs';
export function GET(){return new Response(`User-agent: *\nAllow: /\n${site.indexing?`Sitemap: ${site.productionUrl}/sitemap.xml\n`:'# Client demo: HTML pages carry noindex. Allow crawling so it can be read.\n'}`,{headers:{'Content-Type':'text/plain'}});}
