import {records} from '../src/data.js';
import {createRedis,redisConfiguration} from '../server/redis.js';
import {createGmsHandler} from '../server/gms-handler.js';

export default function handler(req,res) {
  const configuration=redisConfiguration();
  const store=configuration.url&&configuration.token?createRedis(configuration):null;
  return createGmsHandler({records,store,password:process.env.GMS_ADMIN_PASSWORD})(req,res);
}
