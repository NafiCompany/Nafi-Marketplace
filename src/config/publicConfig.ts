export const publicConfig = {
  firebase: {
    apiKey: 'PASTE_FIREBASE_WEB_API_KEY',
    authDomain: 'PASTE_FIREBASE_AUTH_DOMAIN',
    projectId: 'PASTE_FIREBASE_PROJECT_ID',
    storageBucket: 'PASTE_FIREBASE_STORAGE_BUCKET',
    messagingSenderId: 'PASTE_FIREBASE_MESSAGING_SENDER_ID',
    appId: 'PASTE_FIREBASE_APP_ID',
  },
  marketplace: {
    brandName: 'NAFI Marketplace',
    companyName: 'NAFI.COMPANY',
    tagline: 'AI That Works For You.',
    supportEmail: 'support@nafi.company',
    whatsappUrl: '',
    instagramUrl: '',
  },
  payment: {
    qrImagePath: '/assets/payment-qr-placeholder.svg',
    accountName: 'NAFI.COMPANY',
    instructions:
      'Scan QR, bayar sesuai total pesanan, lalu unggah bukti pembayaran. Admin akan memverifikasi sebelum akses produk dibuka.',
  },
} as const;

export function isPublicConfigReady(): boolean {
  const values = Object.values(publicConfig.firebase);
  return values.every((value) => value && !value.startsWith('PASTE_'));
}
