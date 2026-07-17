import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { generateAssistantReply } from '../lib/gemini';

export const telegramRouter = Router();

type TelegramUpdate = {
  message?: { chat:{id:number}; text?:string; from?:{first_name?:string;username?:string} };
};

async function sendTelegram(chatId:number,text:string){
  const token=process.env.TELEGRAM_BOT_TOKEN;
  if(!token)return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text,disable_web_page_preview:true})});
}

telegramRouter.post('/webhook', async (req,res)=>{
  const expected=process.env.TELEGRAM_WEBHOOK_SECRET;
  if(expected && req.header('x-telegram-bot-api-secret-token')!==expected)return res.status(403).json({ok:false});
  res.json({ok:true});
  const update=req.body as TelegramUpdate;
  const message=update.message;
  if(!message?.text)return;
  const text=message.text.trim();
  if(text==='/start'||text==='/help'){
    await sendTelegram(message.chat.id,'Halo! Saya NAFI Assistant dari NAFI Marketplace.\n\nKirim pertanyaan tentang produk, pembayaran QR, atau akses pesanan. Gunakan /products untuk melihat produk unggulan.');return;
  }
  const {data:products}=await supabaseAdmin.from('products').select('name,short_description,price,tags').eq('status','active').order('is_featured',{ascending:false}).limit(10);
  if(text==='/products'){
    const list=(products||[]).slice(0,6).map((product,index)=>`${index+1}. ${product.name} — Rp${Number(product.price).toLocaleString('id-ID')}`).join('\n');
    await sendTelegram(message.chat.id,`Produk unggulan NAFI Marketplace:\n\n${list}\n\nBuka website untuk membeli.`);return;
  }
  const productContext=(products||[]).map((product)=>`- ${product.name}: Rp${Number(product.price).toLocaleString('id-ID')} — ${product.short_description}`).join('\n');
  const reply=await generateAssistantReply({message:text,history:[],productContext});
  await sendTelegram(message.chat.id,reply.slice(0,3900));
});
