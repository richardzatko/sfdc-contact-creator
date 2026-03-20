export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          return res.status(200).end();
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    res.setHeader('Access-Control-Allow-Origin', '*');

  const { emails } = req.body;
    if (!emails || !Array.isArray(emails) || emails.length === 0) return res.status(400).json({ error: 'No emails provided' });

  const webhookUrl = process.env.CLAY_WEBHOOK_URL;
    if (!webhookUrl) return res.status(500).json({ error: 'Clay webhook not configured' });

  let sent = 0;
    let errors = [];

  for (const email of emails) {
        try {
                const r = await fetch(webhookUrl, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email }),
                });
                if (r.ok) sent++;
                else errors.push(email);
        } catch (e) {
                errors.push(email);
        }
  }

  return res.status(200).json({ sent, total: emails.length, errors: errors.length });
}
