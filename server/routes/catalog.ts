import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin';

export const catalogRouter = Router();

catalogRouter.get('/categories', async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('categories').select('id,name,slug,description').order('name');
  if (error) return res.status(500).json({ message: 'Kategori gagal dimuat.' });
  res.json({ data: data || [] });
});

catalogRouter.get('/products', async (req, res) => {
  let query = supabaseAdmin.from('products').select('*, category:categories(id,name,slug,description)').eq('status','active').order('created_at',{ascending:false});
  if (req.query.featured === 'true') query = query.eq('is_featured', true);
  const { data, error } = await query;
  if (error) return res.status(500).json({ message: 'Produk gagal dimuat.' });
  res.json({ data: data || [] });
});

catalogRouter.get('/products/:slug', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('products').select('*, category:categories(id,name,slug,description)').eq('slug',req.params.slug).eq('status','active').single();
  if (error || !data) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
  res.json({ data });
});
