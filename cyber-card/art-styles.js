// Style assets are separate identity/outfit/background packages, never filters.
window.cardArtStyles={
 legacy:{name:'原有版本（已確認）'},
 anime:{name:'日系動畫',size:330,top:168,x:500,bodyScale:1,bodyY:0},
 painted:{name:'半寫實插畫',size:330,top:168,x:500,bodyScale:1,bodyY:0},
 chibi:{name:'Q 版',size:500,top:190,x:482,bodyScale:.79,bodyY:190}
};
for(const[id,pack]of Object.entries(window.cardArtStyles)){
 if(id==='legacy')continue;
 for(const part of ['heads','body','background']){const img=new Image();img.src='styles/'+id+'/'+part+'-v1.png';pack[part]=img;}
 pack.ready=false;
 pack.promise=Promise.all(['heads','body','background'].map(k=>pack[k].decode()))
 .then(()=>{pack.ready=true;window.dispatchEvent(new Event('art-assets-ready'))})
 .catch(()=>{pack.error=true;window.dispatchEvent(new Event('art-assets-ready'))});
}
