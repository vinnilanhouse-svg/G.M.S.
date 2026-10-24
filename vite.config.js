import {defineConfig,loadEnv} from 'vite';

// Mesmo endpoint em desenvolvimento e no Vercel; segredos ficam apenas no Node.
export default defineConfig(({mode})=>{
  function install(server) {
    const env=loadEnv(mode,process.cwd(),'');
    Object.assign(process.env,Object.fromEntries(Object.entries(env).filter(([key])=>/^(UPSTASH_|KV_REST_|GMS_ADMIN_)/.test(key))));
    server.middlewares.use('/api/gms',async(req,res)=>{
      const {default:handler}=await import('./api/gms.js');
      return handler(req,res);
    });
  }
  return {
    build:{modulePreload:false},
    plugins:[{
      name:'gms-server',
      configureServer:install,
      configurePreviewServer:install,
    }],
  };
});
