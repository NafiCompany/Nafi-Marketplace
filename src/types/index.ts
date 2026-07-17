export type ProductStatus = 'draft' | 'active' | 'archived';
export type OrderStatus =
  | 'pending_payment'
  | 'payment_review'
  | 'paid'
  | 'completed'
  | 'cancelled';
export type PaymentStatus = 'unpaid' | 'review' | 'paid' | 'rejected';

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type Product = {
  id: string;
  category_id: string | null;
  category?: Category | null;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  cover_image_url: string | null;
  preview_url: string | null;
  delivery_type: 'download' | 'access_link' | 'manual';
  delivery_url: string | null;
  file_path: string | null;
  status: ProductStatus;
  is_featured: boolean;
  is_best_seller: boolean;
  tags: string[];
  created_at: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  product?: Product | null;
};

export type Order = {
  id: string;
  order_number: string;
  firebase_uid: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  payment_note: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  payment_submissions?: PaymentSubmission[];
};

export type PaymentSubmission = {
  id: string;
  order_id: string;
  proof_path: string;
  proof_url?: string;
  note: string | null;
  status: 'submitted' | 'approved' | 'rejected';
  created_at: string;
};

export type Profile = {
  firebase_uid: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'customer' | 'admin';
};

export type AssistantMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  quickActions?: string[];
};
