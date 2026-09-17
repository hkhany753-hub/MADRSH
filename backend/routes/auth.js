const router = require('express').Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sendTelegramCode } = require('../telegram');

const otpStore = new Map();
const users = new Map();

router.post('/start', async (req,res)=>{
  const { phone, telegramId } = req.body;
  if(!phone || !telegramId) return res.status(400).json({ok:false,message:'phone and telegramId required'});

  const code = Math.floor(100000 + Math.random()*900000).toString();
  otpStore.set(phone,{code, telegramId, expires:Date.now()+120000});

  await sendTelegramCode(telegramId, code);
  res.json({ok:true,message:'OTP sent'});
});

router.post('/verify-code',(req,res)=>{
  const {phone,code}=req.body;
  const item=otpStore.get(phone);

  if(!item || item.expires < Date.now() || item.code !== code)
    return res.status(400).json({ok:false,message:'Invalid code'});

  otpStore.delete(phone);
  res.json({ok:true,verified:true,telegramId:item.telegramId});
});

router.post('/register',(req,res)=>{
  const {name,phone,password,telegramId}=req.body;
  const passwordHash=crypto.createHash('sha256').update(password).digest('hex');

  users.set(phone,{name,phone,passwordHash,telegramId,createdAt:new Date()});
  res.json({ok:true,message:'Account created'});
});

router.post('/login',(req,res)=>{
  const {phone,password}=req.body;
  const user=users.get(phone);
  const hash=crypto.createHash('sha256').update(password).digest('hex');

  if(!user || user.passwordHash!==hash)
    return res.status(401).json({ok:false,message:'Invalid login'});

  const token=jwt.sign({phone},process.env.JWT_SECRET || 'change-this-secret');
  res.json({ok:true,token,user:{name:user.name,phone:user.phone}});
});

module.exports=router;
