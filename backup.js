// Keeps nova.db safe on hosts that erase files (like Render free) by saving it to a private GitHub repo.
const fs=require('fs');
const API=process.env.GH_API||'https://api.github.com',T=process.env.GH_TOKEN,R=process.env.GH_REPO,on=!!(T&&R);
const url=`${API}/repos/${R}/contents/nova.db`;
const H=a=>({Authorization:'Bearer '+T,Accept:a||'application/vnd.github+json','User-Agent':'nova-menu'});
const state={on,lastSaved:null,error:null};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function restore(file){
  if(!on){console.log('Backup is OFF (set GH_TOKEN and GH_REPO to keep your data).');return}
  if(fs.existsSync(file))return;
  try{const r=await fetch(`${API}/repos/${R}`,{headers:H()});
    if(!r.ok)throw new Error('Cannot open GitHub repo "'+R+'" (status '+r.status+'). Check GH_REPO is exactly YOURNAME/nova-backup and the token has Contents: Read and write on that repo.')}
  catch(e){state.error=e.message;throw e}
  for(let i=0;i<4;i++){
    try{const r=await fetch(url,{headers:H('application/vnd.github.raw+json')});
      if(r.ok){fs.writeFileSync(file,Buffer.from(await r.arrayBuffer()));console.log('Database restored from GitHub backup.');return}
      if(r.status===404){console.log('No backup yet - starting fresh.');return}
      console.log('Restore problem, status',r.status)}catch(e){console.log('Restore problem:',e.message)}
    await sleep(3000*(i+1));
  }
  throw new Error('Could not read the backup. Stopping so it is not overwritten. Check GH_TOKEN and GH_REPO.');
}
function make(db,file){
  let timer=null,busy=false,again=false,sha=null;
  async function getSha(){const r=await fetch(url,{headers:H()});sha=r.ok?(await r.json()).sha:null}
  async function run(){
    if(busy){again=true;return}busy=true;
    try{
      db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
      const content=fs.readFileSync(file).toString('base64');
      for(let i=0;i<2;i++){
        if(sha===null||i)await getSha();
        const r=await fetch(url,{method:'PUT',headers:H(),body:JSON.stringify({message:'backup '+new Date().toISOString(),content,sha:sha||undefined})});
        if(r.ok){sha=(await r.json()).content.sha;state.lastSaved=new Date().toISOString();state.error=null;console.log('Backup saved.');break}
        if(i===1){state.error='Backup failed, status '+r.status;console.log(state.error)}
      }
    }catch(e){state.error=e.message;console.log('Backup error:',e.message)}
    busy=false;if(again){again=false;schedule()}
  }
  function schedule(){if(on){clearTimeout(timer);timer=setTimeout(run,15000)}}
  if(on)process.on('SIGTERM',async()=>{clearTimeout(timer);await run();process.exit(0)});
  return{schedule,state};
}
if(!on)console.log('WARNING: backup is OFF. Data WILL be lost when the host restarts.');
module.exports=make;module.exports.restore=restore;
