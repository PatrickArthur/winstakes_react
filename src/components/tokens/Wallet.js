   import React, { useState, useEffect } from 'react';
   import axios from 'axios';
   import './Wallet.css'; // Your CSS file
   import consumer from '../../consumer';

   const Wallet = ({token, profileId}) => {
    const API_URL = 'http://localhost:4000'; // Replace this with your API's base route
    const [tokens, setTokens] = useState([]);
     
    useEffect(() => {
      const fetchTokens = async () => {
        try {
          const response = await fetch(`${API_URL}/profiles/${profileId}/tokens`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (!response.ok) {
            // Handle HTTP errors
            console.error('HTTP error', response.status, response.statusText);
            return;
          }

          const data = await response.json();
          setTokens(data.wallet)

        } catch (error) {
          console.error('Error fetching profile wonks', error);
        }
      };

      fetchTokens();

      const subscription = consumer.subscriptions.create(
       { channel: "WalletChannel" },
       {
         connected() {
           console.log("Connected to the WalletChannel");
         },
         received: (data) => {
          if (data.wallet) {
            setTokens(data.wallet);
          }
         }
       }
      );

      return () => {
        if (subscription) {
          consumer.subscriptions.remove(subscription);
        }
      };
    }, []);
    
    const totalSum = tokens.reduce((acc, token) => {
      const value = parseFloat(token.value); // Convert token value to a number
      return acc + (isNaN(value) ? 0 : value); // Ensure the current value adds to the accumulator safely
    }, 0);
    console.log(tokens[0])

    return (
      <div>
        <p>Total Sum of Tokens: {totalSum}</p>
        <h2>Wallet Tokens</h2>
        <ul>
          {tokens.map((token, index) => (
            <li key={index}>{`ID: ${token.id}, Value: ${token.value}`}</li>
          ))}
        </ul>
      </div>
     );
   };

   export default Wallet;