type ChatHistory = { role: 'user' | 'assistant'; content: string }[];

type GeminiPart = { text: string };

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
  error?: { message?: string; code?: number };
};

const sleep = (ms: number) => new Promise((resolve)=>setTimeout(resolve,ms));

export async function generateAssistantReply(input: {
  message: string;
  history: ChatHistory;
  productContext: string;
  orderContext?: string;
}): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return fallbackReply(input.message);
  }
  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  const system = `Anda adalah NAFI Assistant untuk NAFI Marketplace, toko produk digital premium milik NAFI.COMPANY. Jawab dalam Bahasa Indonesia yang ramah, singkat, dan jelas. Tugas: membantu memilih produk, menjelaskan pembayaran QR, proses verifikasi, akses produk, dan status pesanan bila data tersedia. Jangan mengarang harga, stok, status, promo, atau kebijakan. Jangan meminta password, OTP, PIN, CVV, atau data sensitif. Produk digital tidak otomatis dapat diunduh sebelum pembayaran disetujui.\n\nKATALOG:\n${input.productContext}\n\nDATA PESANAN PENGGUNA (bisa kosong):\n${input.orderContext || 'Tidak tersedia.'}`;
  const contents = [
    { role: 'user', parts: [{ text: system }] },
    ...input.history.slice(-8).map((item)=>({ role: item.role === 'assistant' ? 'model' : 'user', parts:[{text:item.content}] })),
    { role: 'user', parts: [{ text: input.message }] },
  ];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  let lastError = 'Layanan AI tidak tersedia.';
  for (let attempt=0; attempt<3; attempt++) {
    const response = await fetch(url, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ contents, generationConfig:{ temperature:.35, maxOutputTokens:700 } }),
    });
    const data = await response.json() as GeminiResponse;
    if (response.ok) {
      const text = data.candidates?.[0]?.content?.parts?.map((part)=>part.text).join('').trim();
      return text || fallbackReply(input.message);
    }
    lastError = data.error?.message || `Gemini error ${response.status}`;
    if (![429,500,502,503,504].includes(response.status)) break;
    await sleep([900,2200,4500][attempt] + Math.random()*400);
  }
  console.error('Gemini assistant failed:', lastError);
  return fallbackReply(input.message);
}

function fallbackReply(message: string): string {
  const text = message.toLowerCase();
  if (text.includes('bayar') || text.includes('qr')) return 'Pembayaran dilakukan melalui QR yang tampil setelah pesanan dibuat. Bayar sesuai total, lalu unggah bukti pembayaran agar admin dapat memverifikasinya.';
  if (text.includes('download') || text.includes('unduh') || text.includes('akses')) return 'Produk dapat diakses dari menu Akun → Produk Saya setelah pembayaran disetujui oleh admin.';
  if (text.includes('produk') || text.includes('rekomendasi')) return 'Silakan buka menu Produk untuk melihat kursus AI, prompt pack, workflow n8n, template dashboard, ebook, dan bot template. Saya juga dapat membantu memilih berdasarkan kebutuhan Anda.';
  return 'Saya dapat membantu menjelaskan produk, pembayaran QR, proses verifikasi, dan akses pesanan NAFI Marketplace.';
}
