/**
 * ไฟล์นี้ทำหน้าที่เป็น "สะพาน" (Proxy) ระหว่าง Frontend และ Gemini API
 * เพื่อซ่อน API Key ไม่ให้รั่วไหลออกไปยัง Browser ของผู้ใช้
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY; // ดึงจาก Environment Variable ที่ตั้งไว้ใน Vercel/Netlify

    if (!API_KEY) {
        return res.status(500).json({ error: 'ไม่พบ API Key ในระบบหลังบ้าน' });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json(errorData);
        }

        const data = await response.json();
        // ส่งข้อมูลกลับไปให้ Frontend
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ Gemini' });
    }
}