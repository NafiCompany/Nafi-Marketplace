import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authRouter } from './routes/auth';
import { catalogRouter } from './routes/catalog';
import { ordersRouter } from './routes/orders';
import { adminRouter } from './routes/admin';
import { assistantRouter } from './routes/assistant';
import { telegramRouter } from './routes/telegram';

const app=express();
const port=Number(process.env.PORT||3000);
app.use(helmet({contentSecurityPolicy:false,crossOriginResourcePolicy:false}));
app.use(cors());
app.use(express.json({limit:'12mb'}));
app.get('/api/health',(_req,res)=>res.json({success:true,service:'nafi-marketplace-api'}));
app.use('/api/auth',authRouter);
app.use('/api/catalog',catalogRouter);
app.use('/api/orders',ordersRouter);
app.use('/api/admin',adminRouter);
app.use('/api/assistant',assistantRouter);
app.use('/api/telegram',telegramRouter);
app.use('/api',(req,res)=>res.status(404).json({message:`Endpoint API tidak ditemukan: ${req.method} ${req.path}`}));

const __dirname=path.dirname(fileURLToPath(import.meta.url));
if(process.env.NODE_ENV==='production'){
  const dist=path.resolve(__dirname,'../dist');
  app.use(express.static(dist));
  app.get('*',(_req,res)=>res.sendFile(path.join(dist,'index.html')));
}else{
  const {createServer}=await import('vite');
  const vite=await createServer({server:{middlewareMode:true},appType:'spa'});
  app.use(vite.middlewares);
}

app.listen(port,()=>console.log(`NAFI Marketplace running on http://localhost:${port}`));
