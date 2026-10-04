// Defer decorative background artwork until it approaches the viewport. Hero
// artwork is excluded by the template transform. Native links/text stay usable.
export function observeArtwork(root=document) {
  const visible=new WeakSet();
  const reveal=node=>{visible.add(node);node.style.backgroundImage=node.getAttribute('data-launch-background')||'none';};
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){reveal(entry.target);observer.unobserve(entry.target);}
  },{rootMargin:'240px'}):null;
  const watch=node=>{
    if(node.nodeType!==1)return;
    const nodes=[...(node.matches('[data-launch-background]')?[node]:[]),...node.querySelectorAll('[data-launch-background]')];
    for(const item of nodes)if(!observer||visible.has(item))reveal(item);else observer.observe(item);
  };
  watch(root.documentElement||root);
  const mutations=new MutationObserver(entries=>{
    for(const entry of entries)if(entry.type==='attributes')watch(entry.target);else for(const node of entry.addedNodes)watch(node);
  });
  mutations.observe(root.documentElement||root,{subtree:true,childList:true,attributes:true,attributeFilter:['data-launch-background']});
  return ()=>{observer?.disconnect();mutations.disconnect();};
}
