import { Router } from 'express';
import Stripe from 'stripe';
import prisma from '../utils/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout', requireAuth, async (req, res, next) => {
  try {
    const expert = await prisma.expert.findUnique({
      where: { id: req.expert.id },
      select: { id: true, email: true, firstName: true, lastName: true, stripeCustomerId: true },
    });

    let customerId = expert?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: expert.email,
        name: `${expert.firstName} ${expert.lastName}`,
        metadata: { expertId: expert.id },
      });
      customerId = customer.id;
      await prisma.expert.update({ where: { id: expert.id }, data: { stripeCustomerId: customerId } });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/dashboard?sub=success`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard?sub=canceled`,
      metadata: { expertId: expert.id },
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

router.post('/portal', requireAuth, async (req, res, next) => {
  try {
    const expert = await prisma.expert.findUnique({
      where: { id: req.expert.id },
      select: { stripeCustomerId: true },
    });

    if (!expert?.stripeCustomerId) {
      return res.status(400).json({ error: 'Niciun abonament activ' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: expert.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

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
      const expertId = session.metadata?.expertId;
      if (expertId && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        await prisma.expert.update({
          where: { id: expertId },
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
      const expert = await prisma.expert.findFirst({ where: { stripeSubId: sub.id } });
      if (expert) {
        await prisma.expert.update({
          where: { id: expert.id },
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
