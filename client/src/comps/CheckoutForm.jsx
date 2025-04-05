import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import api, { ENDPOINTS } from '../config/api';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
};

const CheckoutForm = ({ orderId, onSuccess, onError }) => {
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState('');
  
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    const createPaymentIntent = async () => {
      try {
        const response = await api.post('/api/payment/create-payment-intent', {
          orderId
        });

        if (response.data.success) {
          setClientSecret(response.data.clientSecret);
        } else {
          setError('Failed to initialize payment. Please try again.');
          if (onError) onError('Failed to initialize payment');
        }
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError('Payment initialization failed. Please try again later.');
        if (onError) onError(err.response?.data?.error || 'Payment initialization failed');
      }
    };

    if (orderId) {
      createPaymentIntent();
    }
  }, [orderId, onError]);

  const handleChange = (event) => {
    // Listen for changes in the CardElement
    setDisabled(event.empty);
    setError(event.error ? event.error.message : '');
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    // Use card element with PaymentIntent to confirm payment
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: 'Customer Name', // You can pass customer name if available
        },
      }
    });

    if (result.error) {
      setError(`Payment failed: ${result.error.message}`);
      setProcessing(false);
      if (onError) onError(result.error.message);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        setError(null);
        setSucceeded(true);
        
        // Call the backend to update the order
        try {
          await api.post('/api/payment/payment-success', {
            orderId,
            paymentIntentId: result.paymentIntent.id
          });
          
          // Call success callback from parent
          if (onSuccess) onSuccess(result.paymentIntent);
        } catch (err) {
          console.error('Error updating order payment status:', err);
          // Payment went through but we had trouble updating the database
          if (onError) onError('Payment was successful but order status may not be updated.');
        }
      }
    }
    setProcessing(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="card-element">
          Credit or debit card
        </label>
        <CardElement
          id="card-element"
          options={CARD_ELEMENT_OPTIONS}
          onChange={handleChange}
        />
        {/* Show any error that happens when processing the payment */}
        {error && (
          <div className="card-error" role="alert">
            {error}
          </div>
        )}
        {/* Show a success message upon completion */}
        {succeeded && (
          <div className="payment-success">
            Payment successful! Thank you for your purchase.
          </div>
        )}
      </div>

      <button
        disabled={processing || disabled || succeeded}
        className="payment-button"
      >
        {processing ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
};

export default CheckoutForm;