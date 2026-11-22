(function(){
  'use strict';
  var button=document.getElementById('check-deployment');
  if(!button)return;
  var expected=document.querySelector('meta[name="ohgs-release"]').content;
  var status=document.getElementById('deployment-check-status');
  var fileRelease=null,result='ready',assetCount=null;
  var requiredFiles=[
    ['media/flyers/ohgs-compact-batching-plant-nov2026-480.webp','image/webp'],
    ['media/flyers/ohgs-compact-batching-plant-nov2026-768.webp','image/webp'],
    ['media/flyers/ohgs-compact-batching-plant-nov2026-1121.webp','image/webp'],
    ['media/flyers/ohgs-compact-batching-plant-nov2026.jpg','image/jpeg'],
    ['media/flyers/ohgs-friday-nov2026-480.webp','image/webp'],
    ['media/flyers/ohgs-friday-nov2026-768.webp','image/webp'],
    ['media/flyers/ohgs-friday-nov2026-1254.webp','image/webp'],
    ['media/flyers/ohgs-friday-nov2026.jpg','image/jpeg'],
    ['product-compact-concrete-batching-plant.html','text/html'],
    ['ohgs-daily-flyers.js','javascript']
  ];
  function sw(){return document.documentElement.lang==='sw'}
  function render(){
    var runtime=document.documentElement.dataset.ohgsMediaRelease;
    document.getElementById('release-html').textContent=expected;
    document.getElementById('release-runtime').textContent=runtime||(sw()?'Haijapakia':'Not loaded');
    document.getElementById('release-file').textContent=fileRelease||(sw()?'Bado haijakaguliwa':'Not checked yet');
    var assets=document.getElementById('release-flyers');
    if(assets)assets.textContent=assetCount===null?(sw()?'Bado haijakaguliwa':'Not checked yet'):assetCount+' / '+requiredFiles.length+' '+(sw()?'yanapatikana':'available');
    var messages={
      ready:['Check the release and the new flyer images, plant page and calendar controller.','Kagua toleo, picha za matangazo mapya, ukurasa wa mtambo na kidhibiti cha kalenda.'],
      checking:['Checking deployed files…','Mafaili yanakaguliwa…'],
      success:['The release matches and all new flyer files are available. Open Home to see today’s feature.','Toleo linafanana na mafaili yote mapya ya matangazo yanapatikana. Fungua Mwanzo kuona tangazo la leo.'],
      missing:['Some new flyer files are missing or have the wrong file type. Upload the complete media/flyers folder and redeploy.','Baadhi ya mafaili mapya ya matangazo hayapo au yana aina isiyo sahihi. Pakia folda nzima ya media/flyers kisha sambaza upya.'],
      mismatch:['The files do not match. Upload the complete package and redeploy the connected project.','Mafaili hayafanani. Pakia kifurushi kizima kisha sambaza upya mradi uliounganishwa.'],
      error:['The version file could not be checked. Confirm the upload and try again.','Faili la toleo halikuweza kukaguliwa. Hakikisha limepakiwa kisha jaribu tena.']
    };
    status.textContent=messages[result][sw()?1:0];status.dataset.result=result;
  }
  button.addEventListener('click',async function(){
    if(button.disabled)return;
    button.disabled=true;button.classList.add('is-sending');button.setAttribute('aria-busy','true');result='checking';render();
    var controller=window.AbortController?new AbortController():null;
    var timer=setTimeout(function(){if(controller)controller.abort()},10000);
    try{
      var response=await fetch('version-check.txt',{cache:'no-store',signal:controller?controller.signal:undefined});
      if(!response.ok)throw new Error('Version request failed');
      var content=await response.text();var match=content.match(/^OHGS RELEASE (v\d+-[a-z0-9-]+)/);
      fileRelease=match?match[1]:null;
      var checks=await Promise.all(requiredFiles.map(async function(item){
        try{var asset=await fetch(item[0],{method:'HEAD',cache:'no-store',signal:controller?controller.signal:undefined});return asset.ok&&(asset.headers.get('content-type')||'').includes(item[1])}catch(error){return false}
      }));
      assetCount=checks.filter(Boolean).length;
      result=fileRelease!==expected||document.documentElement.dataset.ohgsMediaRelease!==expected?'mismatch':assetCount===requiredFiles.length?'success':'missing';
    }catch(error){result='error'}
    finally{clearTimeout(timer);button.disabled=false;button.classList.remove('is-sending');button.removeAttribute('aria-busy');render()}
  });
  window.addEventListener('ohgs:languagechange',render);render();
})();
