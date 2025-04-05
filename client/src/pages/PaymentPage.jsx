import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

// Hard-coded test key - replace this with your actual test key
const STRIPE_KEY = 'pk_test_51RALDxQfw4qIFGhk9yGXyCqkHOGPZ9QCSb4qC6YS45gFz35rMOrbnPd4M2iIsrB8I2D9Myx5HVkMwCkyBbv6bgH800GB4pctas';
const stripePromise = loadStripe(STRIPE_KEY);

const CheckoutForm = ({ totalAmount, orderData, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [succeeded, setSucceeded] = useState(false);

  useEffect(() => {
    // Create a payment intent as soon as the page loads
    const fetchPaymentIntent = async () => {
      try {
        setLoading(true);
        
        // Make API request to create payment intent
        const response = await axios.post('/api/payment/create-payment-intent', { 
          amount: Math.round(totalAmount * 100), // Convert to cents
          metadata: {
            order_id: orderData?.id || 'guest-order'
          }
        });
        
        console.log('Payment intent response:', response.data);
        
        if (response.data && response.data.clientSecret) {
          setClientSecret(response.data.clientSecret);
        } else {
          console.error('No client secret returned:', response.data);
          setErrorMessage('Could not initialize payment. Please try again later.');
        }
      } catch (error) {
        console.error('Error getting payment intent:', error);
        setErrorMessage(
          error.response?.data?.error || 
          'Could not connect to payment service. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (totalAmount > 0) {
      fetchPaymentIntent();
    }
  }, [totalAmount, orderData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      setErrorMessage('Stripe has not initialized. Please refresh the page.');
      return;
    }

    // Validate client secret before attempting to confirm payment
    if (!clientSecret || clientSecret.trim() === '') {
      setErrorMessage('Payment not initialized properly. Please refresh and try again.');
      setLoading(false);
      return;
    }

    console.log('Processing payment with client secret:', clientSecret.substring(0, 10) + '...');

    const cardElement = elements.getElement(CardElement);

    // Confirm card payment
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: orderData?.customerName || 'Test Customer',
          email: orderData?.email || 'test@example.com',
        },
      }
    });

    if (error) {
      console.error('Payment error:', {
        type: error.type,
        code: error.code,
        message: error.message,
        decline_code: error.decline_code,
        param: error.param
      });
      setErrorMessage(error.message || 'An error occurred during payment processing.');
    } else if (paymentIntent.status === 'succeeded') {
      console.log('Payment succeeded:', paymentIntent);
      setSucceeded(true);
      setErrorMessage('');
      
      // Call success callback if provided
      if (onPaymentSuccess) {
        onPaymentSuccess(paymentIntent);
      }
    }

    setLoading(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#d1d1d1',
        fontFamily: 'Cinzel, serif',
        '::placeholder': {
          color: '#8a8a8a',
        },
        iconColor: '#bb0000',
      },
      invalid: {
        color: '#ff6b6b',
        iconColor: '#ff6b6b',
      },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h2>Complete Your Payment</h2>
      
      {succeeded ? (
        <div className="payment-success">
          <h3>Payment Successful!</h3>
          <p>Thank you for your purchase.</p>
          <p>Your order is now being processed.</p>
        </div>
      ) : (
        <>
          <div className="form-group">
            <div className="payment-summary">
              <p>Order Total: <span className="amount">${totalAmount.toFixed(2)}</span></p>
            </div>
          </div>

          <div className="form-group">
            <label>Card Details</label>
            <div className="card-element-container">
              <CardElement options={cardElementOptions} />
            </div>
            <div className="test-card-info">
              <p>Test Card: 4242 4242 4242 4242</p>
              <p>Expiry: Any future date</p>
              <p>CVC: Any 3 digits</p>
            </div>
          </div>
          
          <div className="form-group">
            <button 
              type="submit" 
              disabled={!stripe || loading || !clientSecret}
              className="payment-button"
            >
              {loading ? 'Processing...' : `Pay $${totalAmount.toFixed(2)}`}
            </button>
          </div>
          
          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}

          <div className="secure-payment-notice">
            <i className="fas fa-lock"></i> Secure payment powered by Stripe
          </div>
        </>
      )}
    </form>
  );
};

const PaymentPage = ({ amount = 99.99, orderData = {}, onPaymentSuccess }) => {
  return (
    <div className="payment-container">
      <Elements stripe={stripePromise}>
        <CheckoutForm 
          totalAmount={amount} 
          orderData={orderData}
          onPaymentSuccess={onPaymentSuccess}
        />
      </Elements>
    </div>
  );
};

export default PaymentPage;