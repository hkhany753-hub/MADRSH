const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req,res)=>res.json({ok:true, service:'MADRSH auth'}));
app.use('/api/auth', authRoutes);

const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log(`MADRSH auth server running on ${port}`));
