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
    const cards=[...main.querySelectorAll('article.card[data-slug]')];
    const categories=[
      ['matematika','Matematika'],['fyzika','Fyzika'],['logika','Logika'],
      ['finance','Finance'],['pravdepodobnost','Pravděpodobnost'],['kombinatorika','Kombinatorika'],
      ['geometrie','Geometrie'],['optika','Optika'],['mechanika','Mechanika']
    ];
    const normalize=s=>(s||'').toLocaleLowerCase('cs').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const tags=cards.map(card=>normalize(card.querySelector('.tag')?.textContent));
    const available=categories.filter(([key])=>tags.some(tag=>tag.includes(key)));
    const controls=document.createElement('div');
    controls.setAttribute('aria-label','Řazení a filtrování hádanek');
    controls.style.cssText='display:flex;flex-wrap:wrap;align-items:end;gap:12px;margin:8px 0 18px';
    const makeSelect=(title,items)=>{
      const label=document.createElement('label');
      label.style.cssText='display:flex;flex-direction:column;gap:5px;flex:1 1 190px;font-weight:650;font-size:.92rem';
      label.textContent=title;
      const select=document.createElement('select');
      select.style.cssText='width:100%;min-height:44px;padding:9px 12px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--text);font:inherit';
      for(const [value,name] of items){const opt=document.createElement('option');opt.value=value;opt.textContent=name;select.appendChild(opt);}
      label.appendChild(select);controls.appendChild(label);
      return select;
    };
    const sort=makeSelect('Seřadit podle',[
      ['new','Od nejnovější'],['old','Od nejstarší'],['topic','Podle tématu (A–Z)']
    ]);
    const filter=makeSelect('Téma',[['all','Všechna témata'],...available]);
    main.before(controls);
    const order=new Map(cards.map((card,i)=>[card,i]));
    const primary=card=>{
      const tag=normalize(card.querySelector('.tag')?.textContent);
      const match=categories.find(([key])=>tag.includes(key));
      return match?match[1]:(card.querySelector('.tag')?.textContent||'Ostatní');
    };
    const render=()=>{
      const selected=filter.value;
      const sorted=[...cards].sort((a,b)=>{
        if(sort.value==='old')return order.get(a)-order.get(b);
        if(sort.value==='topic')return primary(a).localeCompare(primary(b),'cs')||order.get(b)-order.get(a);
        return order.get(b)-order.get(a);
      });
      const fragment=document.createDocumentFragment();
      for(const card of sorted){
        card.hidden=selected!=='all'&&!normalize(card.querySelector('.tag')?.textContent).includes(selected);
        fragment.appendChild(card);
      }
      main.appendChild(fragment);
    };
    sort.addEventListener('change',render);
    filter.addEventListener('change',render);
    render();
    if(window.MathJax?.typesetPromise) await MathJax.typesetPromise([main]);
  }catch(e){console.error('Nepodařilo se načíst samostatné hádanky:',e);}
})();