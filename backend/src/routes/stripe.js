import { Router } from 'express';
import Stripe from 'stripe';
import prisma from '../utils/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create checkout session
router.post('/create-checkout', requireAuth, async (req, res, next) => {
  try {
    const jurist = await prisma.jurist.findUnique({
      where: { id: req.jurist.id },
      select: { id: true, email: true, firstName: true, lastName: true, stripeCustomerId: true },
    });

    let customerId = jurist?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: jurist.email,
        name: `${jurist.firstName} ${jurist.lastName}`,
        metadata: { juristId: jurist.id },
      });
      customerId = customer.id;
      await prisma.jurist.update({ where: { id: jurist.id }, data: { stripeCustomerId: customerId } });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/dashboard?sub=success`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard?sub=canceled`,
      metadata: { juristId: jurist.id },
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

// Create billing portal session
router.post('/portal', requireAuth, async (req, res, next) => {
  try {
    const jurist = await prisma.jurist.findUnique({
      where: { id: req.jurist.id },
      select: { stripeCustomerId: true },
    });

    if (!jurist?.stripeCustomerId) {
      return res.status(400).json({ error: 'Niciun abonament activ' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: jurist.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

// Stripe webhook
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotency check
  const existing = await prisma.stripeWebhookEvent.findUnique({ where: { id: event.id } });
  if (existing?.processed) return res.json({ received: true });

  await prisma.stripeWebhookEvent.upsert({
    where: { id: event.id },
    create: { id: event.id, type: event.type },
    update: {},
  });

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const juristId = session.metadata?.juristId;
      if (juristId && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        await prisma.jurist.update({
          where: { id: juristId },
          data: {
            stripeSubId: sub.id,
            subStatus: mapStatus(sub.status),
            subCurrentEnd: new Date(sub.current_period_end * 1000),
          },
        });
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const jurist = await prisma.jurist.findFirst({ where: { stripeSubId: sub.id } });
      if (jurist) {
        await prisma.jurist.update({
          where: { id: jurist.id },
          data: {
            subStatus: mapStatus(sub.status),
            subCurrentEnd: new Date(sub.current_period_end * 1000),
          },
        });
      }
    }

    await prisma.stripeWebhookEvent.update({ where: { id: event.id }, data: { processed: true } });
  } catch (err) {
    console.error('Webhook processing error:', err);
  }

  res.json({ received: true });
});

function mapStatus(stripeStatus) {
  const map = {
    active: 'ACTIVE',
    trialing: 'TRIALING',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    unpaid: 'INACTIVE',
    incomplete: 'INACTIVE',
    incomplete_expired: 'INACTIVE',
  };
  return map[stripeStatus] ?? 'INACTIVE';
}

export default router;
