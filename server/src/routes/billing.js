const express = require('express');
const auth = require('../middleware/auth');
const Stripe = require('stripe');
const router = express.Router();

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

router.post('/create-checkout-session', auth, async (req, res) => {
  if (!stripe) return res.status(501).json({ message: 'Stripe not configured' });
  const { priceId, successUrl, cancelUrl } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId: req.user.sub }
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ message: 'Stripe error' });
  }
});

module.exports = router; 