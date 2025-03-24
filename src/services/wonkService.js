import React, { useState, useEffect } from 'react';

export const CurrentUserProfile = (profileId) => {
  return profileId == localStorage.getItem('profile_id');
};

export const fetchWonks = async (api_url, token, profileId, challengeId, setWonks, setHasMore, page) => {
    try {
        if (!token) {
            throw new Error("Token not found or invalid");
        }

        const apiUrl = challengeId ? 
          `${api_url}/profiles/${challengeId}/wonks?post_type=challenge&page=${page}` : 
          `${api_url}/profiles/${profileId}/wonks?page=${page}`;
       
        const response = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${token}`
            }
          });

        if (!response.ok) {
            // Handle HTTP errors
            console.error('HTTP error', response.status, response.statusText);
            return;
        }

        const data = await response.json(); // Parse the JSON responsex
        const wonkData = data.wonks !== undefined ? data.wonks : data;

        if (wonkData.length > 0) {
            setWonks((prevWonks) => [...prevWonks, ...wonkData]);
        } else {
            setHasMore(false); // No more wonks to load
        }
    

    } catch (error) {
        console.error('Error fetching profile wonks', error);
    }
};

export const submitWonk = async (api_url, token, newWonkContent, setNewWonkContent, challengeId) => {
    try {
        if (!token) {
            throw new Error("Token not found or invalid");
        }

        const apiUrl = challengeId ? 
          `${api_url}/wonks?challenge_id=${challengeId}` : 
          `${api_url}/wonks`;
    
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ wonk: { content: newWonkContent } })
        });

        const data = await response.json();

        if (data.errors) {
            console.error("Wonk creation failed:", data.errors);
            // Add any error-handling logic you want here
        } else {
            // Assuming you want to reset the content after successful creation
            setNewWonkContent("");
        }
    } catch (error) {
        console.error("An error occurred:", error);
        // Add any additional error-handling logic here
    }
};

export const deleteWonk = async (api_url, token, id, setWonks) => {
    try {
      const response = await fetch(`${api_url}/wonks/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'same-origin'
      });

      if (!response.ok) throw new Error('Network response was not ok');

      setWonks((prevWonks) => 
        prevWonks.filter((wonk) => wonk.id !== id)
      );
      
      // Alternatively, you can optimistically update the UI here
      // setWonks(wonks.filter(wonk => wonk.id !== id));
    } catch (error) {
      console.error('Error deleting wonk:', error);
    }
};


export const wonkSubscription = (consumer, profileId, challengeId, setWonks) =>
    consumer.subscriptions.create(
       { channel: "WonkChannel", profile_id: profileId, challenge_id: challengeId }, // Ensure profile_id is passed here
       {
         connected() {
           console.log("Connected to the WonkChannel");
         },
         received: (data) => {
           try {
             const parsedData = typeof data.wonk === 'string' ? JSON.parse(data.wonk) : data.wonk;
             debugger
             // Check if the wonk belongs to the current profile before adding it
             if (parsedData.profile.id == profileId) {
               if (parsedData.action == "delete") {
                 const idToRemove = parsedData.id;
                 setWonks((prevWonks) => 
                   prevWonks.filter((wonk) => wonk.id !== idToRemove)
                 );
               } else {
                 setWonks((prevWonks) => [...prevWonks, parsedData]);
               }
             }
           } catch (error) {
             console.error("Error processing received data", error);
           }
         }
       }
    );

export const useInfiniteScroll = (callback, hasMore) => {
  useEffect(() => {
    const scrollHandler = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100 && hasMore) {
        callback();
      }
    };

    window.addEventListener('scroll', scrollHandler);
    return () => window.removeEventListener('scroll', scrollHandler);
  }, [callback, hasMore]);
};

