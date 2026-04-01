const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  try {
    const { plan, email } = JSON.parse(event.body);
    const priceId = plan === 'creator'
      ? process.env.STRIPE_CREATOR_PRICE
      : process.env.STRIPE_STUDIO_PRICE;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'https://voicio.app/app.html?upgraded=true',
      cancel_url: 'https://voicio.app/app.html',
      allow_promotion_codes: true,
    });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
