# Arsitektur NAFI Marketplace

- Frontend: React + TypeScript + Vite
- Backend: Express di runtime Node.js
- Auth: Firebase Authentication
- Database & Storage: Supabase, hanya diakses backend
- AI Assistant: Gemini API melalui backend
- Telegram: webhook langsung ke backend
- Pembayaran: QR manual + upload bukti + verifikasi admin

Frontend tidak menerima Supabase service key, Firebase service account, Gemini API key, atau Telegram Bot Token.
