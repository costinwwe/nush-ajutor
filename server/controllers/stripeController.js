const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

// @desc    Create payment intent
// @route   POST /api/payment/create-payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    // Check if the order belongs to the logged in user
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this order'
      });
    }
    
    // Check if order is already paid
    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        error: 'Order is already paid'
      });
    }

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100), // Convert to cents
      currency: 'usd',
      metadata: { 
        orderId: orderId,
        userId: req.user.id 
      },
      description: `Order #${orderId.substring(0, 8)} - Berserk Armory`,
      payment_method_types: ['card'],
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent'
    });
  }
};

// @desc    Update order after successful payment
// @route   POST /api/payment/payment-success
// @access  Private
exports.paymentSuccess = async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    // Check if the order belongs to the logged in user
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this order'
      });
    }
    
    // Update order payment status
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: paymentIntentId,
      status: 'completed',
      update_time: Date.now(),
      email_address: req.user.email,
      payment_method: 'stripe'
    };
    
    // Also update order status to processing
    if (order.status === 'pending') {
      order.status = 'processing';
    }
    
    // Save the updated order
    const updatedOrder = await order.save();
    
    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Payment success update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order payment status'
    });
  }
};

// @desc    Webhook handler for Stripe events
// @route   POST /api/payment/webhook
// @access  Public
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature and extract the event
    event = stripe.webhooks.constructEvent(
      req.rawBody, // Raw body of the request
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Handle successful payment
      try {
        const orderId = paymentIntent.metadata.orderId;
        
        if (orderId) {
          const order = await Order.findById(orderId);
          
          if (order && !order.isPaid) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
              id: paymentIntent.id,
              status: 'completed',
              update_time: Date.now(),
              payment_method: 'stripe'
            };
            
            if (order.status === 'pending') {
              order.status = 'processing';
            }
            
            await order.save();
            console.log(`Order ${orderId} marked as paid via webhook`);
          }
        }
      } catch (err) {
        console.error('Error processing payment_intent.succeeded webhook:', err);
      }
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log(`Payment failed for PaymentIntent: ${failedPayment.id}`);
      // You could update the order or send a notification
      break;
      
    // Add more cases as needed
      
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
};