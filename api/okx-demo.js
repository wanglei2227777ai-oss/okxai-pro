import crypto from 'crypto';

const BASE=(process.env.OKX_BASE_URL||'https://openapi.okx.com').replace(/\/$/,'');
const KEY=process.env.OKX_API_KEY;
const SECRET=process.env.OKX_SECRET_KEY;
const PASS=process.env.OKX_PASSPHRASE;

function sign(ts,method,path,body=''){
  return crypto.createHmac('sha256',SECRET).update(ts+method+path+body).digest('base64');
}
async function okx(method,path,payload){
  if(!KEY||!SECRET||!PASS) throw new Error('OKX demo credentials are not configured on server');
  const ts=new Date().toISOString();
  const body=payload?JSON.stringify(payload):'';
  const r=await fetch(BASE+path,{method,headers:{'Content-Type':'application/json','OK-ACCESS-KEY':KEY,'OK-ACCESS-SIGN':sign(ts,method,path,body),'OK-ACCESS-TIMESTAMP':ts,'OK-ACCESS-PASSPHRASE':PASS,'x-simulated-trading':'1'},body:body||undefined});
  const j=await r.json();
  if(!r.ok||j.code!=='0') throw new Error(j.msg||j.code||('HTTP '+r.status));
  return j;
}
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  try{
    const action=req.query.action||'health';
    if(action==='health') return res.status(200).json({ok:true,mode:'DEMO',configured:!!(KEY&&SECRET&&PASS),base:BASE});
    if(action==='balance') return res.status(200).json(await okx('GET','/api/v5/account/balance'));
    if(action==='positions') return res.status(200).json(await okx('GET','/api/v5/account/positions'));
    if(action==='orders') return res.status(200).json(await okx('GET','/api/v5/trade/orders-pending'));
    if(action==='order'){
      if(req.method!=='POST') return res.status(405).json({error:'POST required'});
      const {instId,side,ordType='market',sz,px}=req.body||{};
      if(!['BTC-USDT','ETH-USDT','SOL-USDT'].includes(instId)) return res.status(400).json({error:'instrument not allowed'});
      if(!['buy','sell'].includes(side)||!sz||Number(sz)<=0) return res.status(400).json({error:'invalid order'});
      const payload={instId,tdMode:'cash',side,ordType,sz:String(sz)};
      if(ordType==='limit'){if(!px||Number(px)<=0)return res.status(400).json({error:'limit price required'});payload.px=String(px);}
      return res.status(200).json(await okx('POST','/api/v5/trade/order',payload));
    }
    return res.status(404).json({error:'unknown action'});
  }catch(e){return res.status(500).json({error:e.message,mode:'DEMO'});}
}
