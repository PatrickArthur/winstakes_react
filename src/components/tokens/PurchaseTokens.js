   import React, { useState } from 'react';
   import axios from 'axios';
   import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
   import './tokens.css'; // Your CSS file
   import HCaptcha from '@hcaptcha/react-hcaptcha';
   import { useNavigate } from 'react-router-dom';

   const PurchaseTokens = ({token, profileId}) => {
     const [selectedPack, setSelectedPack] = useState(null);
     const stripe = useStripe();
     const elements = useElements();
     const API_URL = 'http://localhost:4000'; // Replace this with your API's base route
     const [isVerified, setIsVerified] = useState(false)
     const [tokenCap, setTokenCap] = useState(null);
     const packs = [
        { id: 1, tokens: 100, cost: 5, description: 'Small Pack: 100 tokens for $5' },
        { id: 2, tokens: 500, cost: 20, description: 'Medium Pack: 500 tokens for $20 (10% bonus)' },
        { id: 3, tokens: 1000, cost: 35, description: 'Large Pack: 1000 tokens for $35 (30% bonus)' },
        { id: 4, tokens: 5000, cost: 150, description: 'Mega Pack: 5000 tokens for $150 (50% bonus)' },
      ];
     const navigate = useNavigate();

     const handlePackChange = (pack) => {
        setSelectedPack(pack);
     };

     const handleVerificationSuccess = (tokenCap) => {
       console.log('Verified with token:', tokenCap);
       setIsVerified(true);
     };

     const handlePurchase = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
          console.error('Stripe.js has not yet loaded.');
          return;
        }

        const cardElement = elements.getElement(CardElement);

        try {
          // Call your server endpoint to create a payment intent
          const serverResponse = await axios.post(`${API_URL}/tokens/purchase`, {
            tokens: selectedPack.tokens, // Send the tokens amount
            cost: selectedPack.cost      // Optionally, you can also send the cost
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,  // User authentication token
              'Content-Type': 'application/json'
            }
          });
         
          const { client_secret } = serverResponse.data;
          
          // Confirm the card payment
          const paymentConfirmation = await stripe.confirmCardPayment(client_secret, {
             payment_method: {
              card: cardElement,
            },
          });

          if (paymentConfirmation.error) {
            console.error('Payment confirmation error:', paymentConfirmation.error);
            alert(`Purchase failed: ${paymentConfirmation.error.message}`);
          } else if (paymentConfirmation.paymentIntent.status === 'succeeded') {
            alert(`Successfully purchased ${selectedPack.token} tokens.`);
            navigate(`/wallet`);
            // Update UI to reflect new token purchase
          }
        } catch (error) {
          console.error('API request error:', error);
          alert('There was an issue with your purchase. Please try again.');
        }
     };
   
     return (
      <div>
      {!isVerified ? (
        // Show CAPTCHA if not yet verified
        <div className="centered-container">
          <div>
            <h1>Please verify you are not a robot</h1>
            <HCaptcha
              sitekey="ff806556-aa7a-439c-8434-7034ffacbffa"  // Confirm this key
              onVerify={handleVerificationSuccess}           // Ensure handler is functional
            />
          </div>
        </div>
      ) : (
        // Once verified, show the form
        <form className="purchase-form" onSubmit={handlePurchase}>
            <div className="pack-selection">
              {packs.map((pack) => (
                <div key={pack.id} className="pack-item">
                  <input
                    type="radio"
                    id={`pack-${pack.id}`}
                    name="token-pack"
                    value={pack.tokens}
                    onChange={() => handlePackChange(pack)}
                    checked={selectedPack?.id === pack.id}
                    className="pack-radio"
                  />
                  <label htmlFor={`pack-${pack.id}`} className="pack-label">
                    {pack.description}
                  </label>
                </div>
              ))}
            </div>
          <div className="form-group">
            <label htmlFor="card-element">Credit Card Information:</label>
            <CardElement id="card-element" className="card-element" />
          </div>
          <button type="submit" className="submit-button" disabled={!stripe}>
            Buy Tokens
          </button>
        </form>
      )}
    </div>
     );
   };

   export default PurchaseTokens;