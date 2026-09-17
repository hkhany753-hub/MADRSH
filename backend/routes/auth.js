const router = require('express').Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sendTelegramCode } = require('../telegram');
const db = require('../db');

const hashPassword = (p)=>crypto.createHash('sha256').update(p).digest('hex');

router.post('/start', async (req,res)=>{
 const {phone,telegramId}=req.body;
 if(!phone||!telegramId) return res.status(400).json({ok:false,message:'missing data'});
 const code=Math.floor(100000+Math.random()*900000).toString();
 await db.saveOTP(phone,code,telegramId,120);
 await sendTelegramCode(telegramId,code);
 res.json({ok:true,message:'OTP sent'});
});

router.post('/verify-code', async (req,res)=>{
 const otp=await db.getOTP(req.body.phone);
 if(!otp||otp.code!==req.body.code) return res.status(400).json({ok:false,message:'Invalid code'});
 await db.removeOTP(req.body.phone);
 res.json({ok:true,verified:true,telegramId:otp.telegram_id});
});

router.post('/register', async(req,res)=>{
 const {name,phone,password,telegramId}=req.body;
 const user=await db.createUser({name,phone,telegramId,passwordHash:hashPassword(password)});
 res.json({ok:true,user});
});

router.post('/login', async(req,res)=>{
 const user=await db.findUser(req.body.phone);
 if(!user||user.password_hash!==hashPassword(req.body.password)) return res.status(401).json({ok:false});
 const token=jwt.sign({id:user.id,phone:user.phone},process.env.JWT_SECRET||'secret',{expiresIn:'7d'});
 res.json({ok:true,token,user:{name:user.name,phone:user.phone}});
});

module.exports=router;
