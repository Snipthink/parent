export async function loadJSON(path){
  try{
    const r=await fetch(path,{cache:'no-store'});
    if(!r.ok) throw new Error('Failed to load '+path);
    return await r.json();
  }catch(error){
    const bundle=window.CLINIC_DATA;
    if(!bundle) throw error;
    const normalized=path.replace(/^\.\//,'');
    const langMatch=normalized.match(/^data\/languages\/([^/]+)\.json$/);
    if(langMatch && bundle.languages?.[langMatch[1]]) return bundle.languages[langMatch[1]];
    if(normalized==='themes/theme.json' && bundle.theme) return bundle.theme;
    const key=normalized.match(/^data\/([^/]+)\.json$/)?.[1];
    if(key && bundle.base?.[key]) return bundle.base[key];
    throw error;
  }
}
export function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
