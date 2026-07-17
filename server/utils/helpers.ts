export function orderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0,10).replaceAll('-','');
  const random = Math.random().toString(36).slice(2,8).toUpperCase();
  return `NAFI-${date}-${random}`;
}

export function decodeBase64Image(value: string): Buffer {
  const clean = value.replace(/^data:[^;]+;base64,/i, '').replace(/\s+/g, '');
  return Buffer.from(clean, 'base64');
}
