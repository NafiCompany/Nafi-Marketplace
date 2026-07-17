import { Router } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middleware/auth';
import { optionalAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { generateAssistantReply } from '../lib/gemini';

export const assistantRouter = Router();

assistantRouter.get('/health', (_req,res)=>res.json({ success:true, service:'nafi-marketplace-assistant' }));

assistantRouter.post('/chat', optionalAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({
    message:z.string().min(1).max(2000),
    history:z.array(z.object({role:z.enum(['user','assistant']),content:z.string().max(2000)})).max(10).default([]),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message:'Pesan tidak valid.' });

  const { data: products } = await supabaseAdmin.from('products').select('name,short_description,price,tags').eq('status','active').order('is_featured',{ascending:false}).limit(12);
  const productContext = (products || []).map((product)=>`- ${product.name}: Rp${Number(product.price).toLocaleString('id-ID')} — ${product.short_description} [${(product.tags||[]).join(', ')}]`).join('\n');
  let orderContext = '';
  if (req.authUser) {
    const { data: orders } = await supabaseAdmin.from('orders').select('order_number,status,payment_status,total_amount,created_at').eq('firebase_uid',req.authUser.uid).order('created_at',{ascending:false}).limit(5);
    orderContext = (orders || []).map((order)=>`- ${order.order_number}: ${order.status}, pembayaran ${order.payment_status}, total Rp${Number(order.total_amount).toLocaleString('id-ID')}`).join('\n');
  }
  const message = await generateAssistantReply({ message:parsed.data.message, history:parsed.data.history, productContext, orderContext });
  res.json({ data:{ message } });
});
