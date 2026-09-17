const router = require('express').Router();
const crypto = require('crypto');
const { sendTelegramCode } = require('../telegram');

const otpStore = new Map();

router.post('/start', async (req,res)=>{
  const {phone, telegramId}=req.body;
  const code = Math.floor(100000 + Math.random()*900000).toString();

  otpStore.set(phone,{code, telegramId, expires:Date.now()+120000});

  try {
    await sendTelegramCode(telegramId, code);
    res.json({ok:true,message:'OTP sent'});
  } catch(e){
    res.status(500).json({ok:false,error:e.message});
  }
});

router.post('/verify-code',(req,res)=>{
  const {phone,code}=req.body;
  const item=otpStore.get(phone);

  if(!item || item.expires<Date.now() || item.code!==code)
    return res.status(400).json({ok:false,message:'Invalid code'});

  otpStore.delete(phone);
  res.json({ok:true,verified:true});
});

router.post('/register',(req,res)=>{
  const {name,phone,password}=req.body;
  const passwordHash=crypto.createHash('sha256').update(password).digest('hex');

  res.json({ok:true,user:{name,phone,passwordHash}});
});

module.exports=router;
