const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'welcome@voicio.app';

async function sendEmail(to, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + RESEND_API_KEY
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html })
  });
  return res.json();
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  try {
    const { email, name, sequence } = JSON.parse(event.body);
    if (!email) return { statusCode: 400, body: 'Missing email' };

    const firstName = name?.split(' ')[0] || 'there';

    const emails = {
      welcome: {
        subject: `Welcome to Voicio, ${firstName} 👋`,
        html: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a1a2e">
  <div style="margin-bottom:32px">
    <span style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:white;padding:8px 14px;border-radius:8px;font-weight:700;font-size:1.1rem">Voicio</span>
  </div>
  <h1 style="font-size:1.8rem;font-weight:800;margin-bottom:12px;color:#07080f">You're in. Let's build your LinkedIn presence.</h1>
  <p style="color:#64748b;line-height:1.7;margin-bottom:20px">Hey ${firstName}, welcome to Voicio — the LinkedIn content OS built for creators who want to sound like themselves, not like a chatbot.</p>
  <p style="color:#64748b;line-height:1.7;margin-bottom:20px">Here's what to do first:</p>
  <ol style="color:#64748b;line-height:2;padding-left:20px;margin-bottom:28px">
    <li>Go to <strong>Generate</strong> and write your first post</li>
    <li>Set up your <strong>Content Pillars</strong> (3 topics you want to own)</li>
    <li>Use <strong>Algorithm Audit</strong> to score any post before publishing</li>
  </ol>
  <a href="https://voicio.app/app.html" style="display:inline-block;background:#3b82f6;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-bottom:32px">Open Voicio →</a>
  <p style="color:#94a3b8;font-size:0.82rem;line-height:1.6">You're on the free plan — 10 AI posts/month. Reply to this email anytime with questions.<br>Trevor · Flatirons Creative Studio</p>
</div>`
      },
      day3: {
        subject: `3 LinkedIn hooks that actually stop the scroll`,
        html: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a1a2e">
  <div style="margin-bottom:32px">
    <span style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:white;padding:8px 14px;border-radius:8px;font-weight:700;font-size:1.1rem">Voicio</span>
  </div>
  <h1 style="font-size:1.6rem;font-weight:800;margin-bottom:12px">The 3 hooks that get 10x more impressions</h1>
  <p style="color:#64748b;line-height:1.7;margin-bottom:20px">Hey ${firstName}, quick tip from your Voicio content OS:</p>
  <p style="color:#64748b;line-height:1.7;margin-bottom:8px">The first line of your LinkedIn post decides everything. Here are the 3 patterns that consistently outperform:</p>
  <div style="background:#f8fafc;border-left:3px solid #3b82f6;padding:16px 20px;margin:20px 0;border-radius:0 8px 8px 0">
    <p style="margin:0;color:#1e293b;font-weight:600">1. The Contrarian</p>
    <p style="margin:8px 0 0;color:#64748b;font-size:0.9rem">"Everyone says X. They're wrong."</p>
  </div>
  <div style="background:#f8fafc;border-left:3px solid #8b5cf6;padding:16px 20px;margin:20px 0;border-radius:0 8px 8px 0">
    <p style="margin:0;color:#1e293b;font-weight:600">2. The Specific Number</p>
    <p style="margin:8px 0 0;color:#64748b;font-size:0.9rem">"I made $47k from one LinkedIn post. Here's exactly how."</p>
  </div>
  <div style="background:#f8fafc;border-left:3px solid #10b981;padding:16px 20px;margin:20px 0;border-radius:0 8px 8px 0">
    <p style="margin:0;color:#1e293b;font-weight:600">3. The Confession</p>
    <p style="margin:8px 0 0;color:#64748b;font-size:0.9rem">"I wasted 2 years doing this. Don't make the same mistake."</p>
  </div>
  <p style="color:#64748b;line-height:1.7;margin-bottom:24px">Use Voicio's <strong>A/B Hook Tester</strong> to generate 3 variants of any hook instantly.</p>
  <a href="https://voicio.app/app.html" style="display:inline-block;background:#3b82f6;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-bottom:32px">Try A/B Hooks →</a>
  <p style="color:#94a3b8;font-size:0.82rem">Trevor · Voicio</p>
</div>`
      },
      day7: {
        subject: `How's your LinkedIn content going, ${firstName}?`,
        html: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a1a2e">
  <div style="margin-bottom:32px">
    <span style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:white;padding:8px 14px;border-radius:8px;font-weight:700;font-size:1.1rem">Voicio</span>
  </div>
  <h1 style="font-size:1.6rem;font-weight:800;margin-bottom:12px">One week in — here's what the best creators do differently</h1>
  <p style="color:#64748b;line-height:1.7;margin-bottom:20px">Hey ${firstName}, it's been a week since you joined Voicio. The creators who grow fastest on LinkedIn share one habit:</p>
  <p style="color:#1e293b;font-size:1.1rem;font-weight:600;margin-bottom:20px;padding:20px;background:#f0f9ff;border-radius:8px">They batch-create 5 posts every Monday, then schedule them throughout the week.</p>
  <p style="color:#64748b;line-height:1.7;margin-bottom:20px">Voicio's <strong>Series Planner</strong> does this in one click — generate 5 connected posts with a narrative arc before you've finished your coffee.</p>
  <p style="color:#64748b;line-height:1.7;margin-bottom:24px">If you're hitting the 10-post free limit, Creator plan ($29/mo) gives you unlimited generation plus the full scheduler.</p>
  <a href="https://voicio.app/app.html" style="display:inline-block;background:#3b82f6;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-bottom:32px">Open Series Planner →</a>
  <p style="color:#94a3b8;font-size:0.82rem">Trevor · Voicio · <a href="https://voicio.app/privacy.html" style="color:#94a3b8">Unsubscribe</a></p>
</div>`
      },
      day14: {
        subject: `Still on free? Here's what you're missing`,
        html: `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a1a2e">
  <div style="margin-bottom:32px">
    <span style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:white;padding:8px 14px;border-radius:8px;font-weight:700;font-size:1.1rem">Voicio</span>
  </div>
  <h1 style="font-size:1.6rem;font-weight:800;margin-bottom:12px">14 days in — time to level up?</h1>
  <p style="color:#64748b;line-height:1.7;margin-bottom:20px">Hey ${firstName}, you've been using Voicio for two weeks. If you've hit the free limit or want to go deeper, here's what Creator unlocks:</p>
  <table style="width:100%;border-collapse:collapse;margin-bottom:28px">
    <tr style="background:#f8fafc"><td style="padding:12px;color:#64748b;font-size:0.9rem">✓ Unlimited AI posts</td><td style="padding:12px;color:#64748b;font-size:0.9rem">✓ Voice cloning</td></tr>
    <tr><td style="padding:12px;color:#64748b;font-size:0.9rem">✓ Post scheduler</td><td style="padding:12px;color:#64748b;font-size:0.9rem">✓ Bulk CSV upload</td></tr>
    <tr style="background:#f8fafc"><td style="padding:12px;color:#64748b;font-size:0.9rem">✓ Series planner</td><td style="padding:12px;color:#64748b;font-size:0.9rem">✓ Google Sheets sync</td></tr>
  </table>
  <a href="https://voicio.app/app.html" style="display:inline-block;background:#3b82f6;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-bottom:16px">Upgrade to Creator — $29/mo →</a>
  <p style="color:#94a3b8;font-size:0.82rem;margin-top:24px">Trevor · Voicio · <a href="https://voicio.app/privacy.html" style="color:#94a3b8">Unsubscribe</a></p>
</div>`
      }
    };

    const emailContent = emails[sequence || 'welcome'];
    if (!emailContent) return { statusCode: 400, body: 'Unknown sequence' };

    const result = await sendEmail(email, emailContent.subject, emailContent.html);
    return { statusCode: 200, body: JSON.stringify(result) };

  } catch(err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
