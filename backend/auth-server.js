// MADRSH Authentication Backend
// Telegram OTP + registration token flow

const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const app = express();

app.use(express.json());

const registrations = new Map();

function createOTP(){
  return Math.floor(100000 + Math.random()*900000).toString();
}

function createToken(){
  return crypto.randomBytes(24).toString('hex');
}

// Website starts registration and receives a private Telegram start token
app.post('/auth/start', (req,res)=>{
  const {phone,name}=req.body;
  const token=createToken();

  registrations.set(token, {
    phone,
    name,
    telegram_id:null,
    otp:null,
    expires:Date.now()+10*60*1000
  });

  res.json({
    success:true,
    telegramLink:`https://t.me/MADRSH_LoginBot?start=${token}`
  });
});

// Telegram bot connects the user
app.post('/api/auth/telegram/connect', async (req,res)=>{
  const {token, telegram_id}=req.body;
  const user=registrations.get(token);

  if(!user || user.expires<Date.now())
    return res.status(400).json({success:false,message:'Invalid token'});

  user.telegram_id=telegram_id;
  user.otp=createOTP();
  registrations.set(token,user);

  res.json({success:true,otp:user.otp});
});

// Verify code entered on website
app.post('/auth/verify-code',(req,res)=>{
  const {token,code}=req.body;
  const user=registrations.get(token);

  if(!user || user.expires<Date.now() || user.otp!==code)
    return res.status(400).json({success:false,message:'Invalid code'});

  res.json({success:true,verified:true,name:user.name,phone:user.phone});
});

app.listen(3000,()=>console.log('MADRSH auth server running'));
