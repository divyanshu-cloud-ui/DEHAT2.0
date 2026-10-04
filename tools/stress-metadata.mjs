import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
import {performance} from 'node:perf_hooks';
import {createRouter,LANGUAGES,LEGAL_ROUTES} from '../launch/routes.mjs';
import {PRODUCTION_ORIGIN} from '../launch/config.mjs';
import {buildHead} from '../launch/head.mjs';
import {buildGraph} from '../launch/schema.mjs';
import {buildSitemap} from '../launch/discovery.mjs';
import {validateLaunchInputs,seoRecordFor} from './validate-launch-inputs.mjs';

const root=process.cwd();
const context={window:{}};
vm.runInNewContext(await readFile('stories-data.js','utf8'),context);
const stories=Array.from(context.window.STORIES);
const router=createRouter(stories);
const entries=[...router.inventory({localized:true}).map(({id,lang,path})=>({routeId:id,lang,path,kind:'app'})),...LEGAL_ROUTES.map(({id,path})=>({routeId:id,lang:'en',path,kind:'legal'}))];
const input=await validateLaunchInputs({root,routes:router.inventory({localized:true})});
const tracked=new Set(execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean));
const faqContext={};faqContext.window=faqContext;
vm.runInNewContext(await readFile('faq-data.js','utf8'),faqContext);
const englishFaq=Array.from(faqContext.FAQ.ITEMS);
const translations=new Map();
for(const lang of LANGUAGES.filter(code=>code!=='en')){
  const box={};box.window=box;
  vm.runInNewContext(await readFile(`content-i18n/${lang}.js`,'utf8'),box);
  translations.set(lang,box.CONTENT_I18N?.[lang]?.faq||{});
}
const faqItemsFor=lang=>englishFaq.map((item,index)=>Object.fromEntries(['q','a'].map(field=>{
  const value=translations.get(lang)?.[index]?.[field];
  return [field,typeof value==='string'&&value.trim()?value:item[field]];
})));
const types={};const exceptions=[];let calls=0;let minTags=Infinity;let maxTags=0;
const start=performance.now();
for(const entry of entries){
  try{
    const route={...router.parseUrl(entry.path),path:entry.path};
    let seo=seoRecordFor(input.seo,route);
    if(entry.kind==='legal'){
      const source=LEGAL_ROUTES.find(item=>item.id===entry.routeId).source;
      const html=await readFile(source,'utf8');
      seo={title:html.match(/<title>([^<]+)<\/title>/i)?.[1],description:html.match(/<meta name="description" content="([^"]+)"/i)?.[1],ogImage:input.seo.en.home.ogImage};
    }
    const head=buildHead({route,seo,origin:PRODUCTION_ORIGIN,languages:LANGUAGES,pathFor:router.pathFor});
    const tags=head.split('\n').length;
    minTags=Math.min(minTags,tags);maxTags=Math.max(maxTags,tags);
    const seoFor=(id,lang=route.lang)=>input.seo?.[lang]?.[id.replace(/^story\//,'')]||input.seo?.[lang]?.[id];
    const graph=buildGraph({route,seo,seoFor,fields:input.schema,stories,assetExists:p=>tracked.has(p),origin:PRODUCTION_ORIGIN,faqItems:entry.routeId==='answers'?faqItemsFor(entry.lang):undefined});
    for(const node of graph['@graph']){
      const type=node['@type'];types[type]=(types[type]||0)+1;
    }
    calls++;
  }catch(error){exceptions.push({path:entry.path,message:error.message});}
}
const sitemap=buildSitemap({entries,origin:PRODUCTION_ORIGIN,lastmodFor:()=>null});
console.log(JSON.stringify({calls,exceptions:exceptions.length,exceptionSamples:exceptions.slice(0,5),tagsPerRoute:{min:minTags,max:maxTags},nodeTypes:types,totalMs:Math.round(performance.now()-start),sitemap:{entries:entries.length,bytes:Buffer.byteLength(sitemap),xhtmlLinks:(sitemap.match(/<xhtml:link /g)||[]).length}},null,2));
if(exceptions.length)process.exitCode=1;
