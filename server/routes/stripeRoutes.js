const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @route   POST /api/payment/create-payment-intent
// @desc    Create a payment intent
// @access  Public
router.post('/create-payment-intent', async (req, res) => {
  try {
    console.log('Received payment intent request:', req.body);
    
    const { amount, currency = 'usd', metadata = {} } = req.body;

    if (!amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide an amount' 
      });
    }

    // Log for debugging
    console.log(`Creating payment intent for amount: ${amount} ${currency}`);
    
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Stripe requires integers in cents
      currency,
      metadata: {
        ...metadata,
        integration_check: 'accept_a_payment'
      }
    });

    // Debug log pattern of client secret
    console.log("Payment intent created with client secret pattern:", 
             paymentIntent.client_secret.replace(/./g, '*').replace(/^\*+_secret_\*+$/, '[correct-pattern]'));

    // Return the client secret
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Something went wrong with payment processing'
    });
  }
});

// @route   POST /api/payment/webhook
// @desc    Handle Stripe webhook events
// @access  Public
router.post('/webhook', async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;

  try {
    // Verify the event came from Stripe
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(
        req.rawBody, 
        signature, 
        endpointSecret
      );
    } else {
      // If webhook secret isn't set, just use the raw body
      event = JSON.parse(req.rawBody);
      console.log('Webhook signature verification bypassed - no secret configured');
    }
    
    // Handle specific events
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent ${paymentIntent.id} was successful!`);
        // Update your database, fulfill the order, etc.
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log(`Payment failed for PaymentIntent ${failedPayment.id}: ${failedPayment.last_payment_error?.message || 'Unknown error'}`);
        // Handle failed payment
        break;
        
      // Add more cases as needed
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

module.exports = router;