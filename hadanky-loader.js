(async()=>{
  const main=document.getElementById('hadanky');
  if(!main)return;
  try{
    const manifest=await fetch('hadanky/manifest.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('manifest');return r.json()});
    const existing=new Set([...main.querySelectorAll('article.card[data-slug]')].map(x=>x.dataset.slug));
    for(const file of manifest.cards){
      const html=await fetch('hadanky/'+file,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(file);return r.text()});
      const t=document.createElement('template');t.innerHTML=html.trim();
      const card=t.content.querySelector('article.card[data-slug]');
      if(card&&!existing.has(card.dataset.slug)){main.appendChild(card);existing.add(card.dataset.slug);}
    }
    if(window.MathJax?.typesetPromise) await MathJax.typesetPromise([main]);
  }catch(e){console.error('Nepodařilo se načíst samostatné hádanky:',e);}
})();
