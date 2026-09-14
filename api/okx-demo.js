import crypto from 'crypto';

const BASE=(process.env.OKX_BASE_URL||'https://www.okx.com').replace(/\/$/,'');
const KEY=process.env.OKX_API_KEY;
const SECRET=process.env.OKX_SECRET_KEY;
const PASS=process.env.OKX_PASSPHRASE;
const MODE=(process.env.OKX_TRADING_MODE||'DEMO').toUpperCase();
const ALLOW_LIVE=process.env.ALLOW_LIVE_TRADING==='YES_I_UNDERSTAND';
const FRONTEND_ORIGIN=(process.env.FRONTEND_ORIGIN||'https://wanglei2227777ai-oss.github.io').replace(/\/$/,'');

function isDemo(){return MODE!=='LIVE' || !ALLOW_LIVE;}
function sign(ts,method,path,body=''){
  return crypto.createHmac('sha256',SECRET).update(ts+method+path+body).digest('base64');
}
function setCors(req,res){
  const origin=req.headers.origin||'';
  if(origin===FRONTEND_ORIGIN || !origin){
    if(origin) res.setHeader('Access-Control-Allow-Origin',origin);
    res.setHeader('Vary','Origin');
  }
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
}
async function okx(method,path,payload){
  if(!KEY||!SECRET||!PASS) throw new Error('OKX credentials are not configured on server');
  const ts=new Date().toISOString();
  const body=payload?JSON.stringify(payload):'';
  const headers={
    'Content-Type':'application/json',
    'OK-ACCESS-KEY':KEY,
    'OK-ACCESS-SIGN':sign(ts,method,path,body),
    'OK-ACCESS-TIMESTAMP':ts,
    'OK-ACCESS-PASSPHRASE':PASS
  };
  if(isDemo()) headers['x-simulated-trading']='1';
  const r=await fetch(BASE+path,{method,headers,body:body||undefined});
  const j=await r.json();
  if(!r.ok||j.code!=='0') throw new Error(j.msg||j.code||('HTTP '+r.status));
  return j;
}
export default async function handler(req,res){
  setCors(req,res);
  res.setHeader('Cache-Control','no-store');
  if(req.method==='OPTIONS') return res.status(204).end();
  const origin=req.headers.origin||'';
  if(origin && origin!==FRONTEND_ORIGIN) return res.status(403).json({error:'origin not allowed'});
  try{
    const action=req.query.action||'health';
    const configured=!!(KEY&&SECRET&&PASS);
    const effectiveMode=isDemo()?'DEMO':'LIVE';
    if(action==='health') return res.status(200).json({
      ok:true,
      configured,
      mode:effectiveMode,
      requestedMode:MODE,
      liveUnlocked:ALLOW_LIVE,
      keyHint:KEY?('••••'+KEY.slice(-4)):null,
      base:BASE,
      frontendOrigin:FRONTEND_ORIGIN
    });
    if(action==='account'){
      const j=await okx('GET','/api/v5/account/config');
      const a=j.data?.[0]||{};
      return res.status(200).json({ok:true,mode:effectiveMode,account:{uid:a.uid?String(a.uid).replace(/.(?=.{4})/g,'•'):null,acctLv:a.acctLv||null,posMode:a.posMode||null,autoLoan:a.autoLoan||null}});
    }
    if(action==='balance') return res.status(200).json(await okx('GET','/api/v5/account/balance'));
    if(action==='positions') return res.status(200).json(await okx('GET','/api/v5/account/positions'));
    if(action==='orders') return res.status(200).json(await okx('GET','/api/v5/trade/orders-pending'));
    if(action==='order'){
      if(req.method!=='POST') return res.status(405).json({error:'POST required'});
      if(!isDemo()) return res.status(423).json({error:'LIVE order route is locked by default'});
      const {instId,side,ordType='market',sz,px}=req.body||{};
      if(!['BTC-USDT','ETH-USDT','SOL-USDT'].includes(instId)) return res.status(400).json({error:'instrument not allowed'});
      if(!['buy','sell'].includes(side)||!sz||Number(sz)<=0) return res.status(400).json({error:'invalid order'});
      if(!['market','limit'].includes(ordType)) return res.status(400).json({error:'order type not allowed'});
      const payload={instId,tdMode:'cash',side,ordType,sz:String(sz)};
      if(ordType==='limit'){
        if(!px||Number(px)<=0) return res.status(400).json({error:'limit price required'});
        payload.px=String(px);
      }
      return res.status(200).json(await okx('POST','/api/v5/trade/order',payload));
    }
    return res.status(404).json({error:'unknown action'});
  }catch(e){return res.status(500).json({error:e.message,mode:isDemo()?'DEMO':'LIVE'});}
}
