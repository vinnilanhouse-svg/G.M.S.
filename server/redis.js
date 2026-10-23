export function redisConfiguration(env=process.env) {
  return {url:env.UPSTASH_REDIS_REST_URL||env.KV_REST_API_URL,token:env.UPSTASH_REDIS_REST_TOKEN||env.KV_REST_API_TOKEN};
}

export function createRedis({url,token},fetcher=fetch) {
  async function send(path,body) {
    const response=await fetcher(`${url.replace(/\/$/,'')}${path}`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(8000)});
    if(!response.ok)throw new Error('O armazenamento está temporariamente indisponível.');
    return response.json();
  }
  return {
    async command(...args) {const result=await send('',args);if(result.error)throw new Error('Falha no armazenamento.');return result.result;},
    async pipeline(commands) {const results=await send('/pipeline',commands);if(results.some(result=>result.error))throw new Error('Falha no armazenamento.');return results.map(result=>result.result);},
  };
}
