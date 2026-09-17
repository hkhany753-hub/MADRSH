// MADRSH Authentication Backend
// Telegram OTP + phone/password authentication foundation

const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

const otpStore = new Map();

function createOTP(){
  return Math.floor(100000 + Math.random()*900000).toString();
}

app.post('/auth/start', (req,res)=>{
  const {phone,name}=req.body;
  const code=createOTP();
  otpStore.set(phone,{name,code,expires:Date.now()+120000});

  // TODO: connect Telegram Bot API (@MADRSH_LoginBot)
  // Send code to user's Telegram account here

  res.json({success:true,message:'OTP created'});
});

app.post('/auth/verify-code',(req,res)=>{
  const {phone,code}=req.body;
  const data=otpStore.get(phone);

  if(!data || data.expires<Date.now() || data.code!==code)
    return res.status(400).json({success:false,message:'Invalid code'});

  otpStore.delete(phone);
  res.json({success:true,name:data.name,verified:true});
});

app.post('/auth/hash-password',(req,res)=>{
  const hash=crypto.createHash('sha256').update(req.body.password).digest('hex');
  res.json({hash});
});

app.listen(3000,()=>console.log('MADRSH auth server running'));
