const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  const PB_URL = 'https://pb.voicio.app';
  const PB_ADMIN_TOKEN = process.env.PB_ADMIN_TOKEN;

  async function updateUserPlan(email, plan) {
    // Find user by email
    const searchRes = await fetch(
      `${PB_URL}/api/collections/users/records?filter=email='${email}'`,
      { headers: { 'Authorization': `Bearer ${PB_ADMIN_TOKEN}` } }
    );
    const data = await searchRes.json();
    if (!data.items?.length) return;

    const userId = data.items[0].id;
    await fetch(`${PB_URL}/api/collections/users/records/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PB_ADMIN_TOKEN}`
      },
      body: JSON.stringify({ plan })
    });
  }

  const priceToplan = {
    [process.env.STRIPE_CREATOR_PRICE]: 'creator',
    [process.env.STRIPE_STUDIO_PRICE]: 'studio'
  };

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object;
        const email = session.customer_email;
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0]?.price?.id;
        const plan = priceToplan[priceId] || 'creator';
        if (email) await updateUserPlan(email, plan);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = stripeEvent.data.object;
        const customer = await stripe.customers.retrieve(sub.customer);
        if (customer.email) await updateUserPlan(customer.email, 'free');
        break;
      }
    }
  } catch(err) {
    console.error('Webhook handler error:', err);
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
