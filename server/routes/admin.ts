import { Router } from 'express';
import { requireAdmin } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabaseAdmin';

export const adminRouter = Router();
adminRouter.use(requireAdmin);

adminRouter.get('/orders', async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('orders').select('*, order_items(*), payment_submissions(*)').order('created_at',{ascending:false});
  if (error) return res.status(500).json({ message:'Pesanan admin gagal dimuat.' });
  res.json({ data:data || [] });
});

adminRouter.patch('/orders/:id', async (req, res) => {
  const allowedStatus = ['pending_payment','payment_review','paid','completed','cancelled'];
  const allowedPayment = ['unpaid','review','paid','rejected'];
  const status = String(req.body.status || '');
  const paymentStatus = String(req.body.payment_status || '');
  if (!allowedStatus.includes(status) || !allowedPayment.includes(paymentStatus)) return res.status(400).json({ message:'Status tidak valid.' });
  const { data, error } = await supabaseAdmin.from('orders').update({ status, payment_status:paymentStatus, updated_at:new Date().toISOString() }).eq('id',req.params.id).select('*').single();
  if (error || !data) return res.status(500).json({ message:'Status pesanan gagal diperbarui.' });
  res.json({ data });
});

adminRouter.get('/products', async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('products').select('*').order('created_at',{ascending:false});
  if (error) return res.status(500).json({ message:'Produk admin gagal dimuat.' });
  res.json({ data:data || [] });
});
