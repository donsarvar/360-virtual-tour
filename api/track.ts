import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Foydalanuvchining IP manzilini aniqlash
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const data = req.body;
  
  // Ma'lumotlarni Vercel Dashboard Logs bo'limiga chiqarish
  console.log(`[VISITOR_LOG] IP: ${ip} | Location: ${data.city || 'Unknown'}, ${data.country || 'Unknown'} | Device: ${data.device || 'Unknown'}`);
  
  return res.status(200).json({ success: true });
}
