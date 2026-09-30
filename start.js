const path=require('path');
require('./backup').restore(process.env.DB_PATH||path.join(__dirname,'nova.db'))
  .then(()=>require('./server.js')).catch(e=>{console.error(e.message);process.exit(1)});
