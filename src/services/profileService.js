import React, { useState, useEffect } from 'react';

export const fetchProfile = async (api_url, profileId, token, setIsFollowerOfCreator) => {
	const storedProfileId = localStorage.getItem('profile_id');
	try {
		const response = await fetch(`${api_url}/profiles/${profileId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (!response.ok) {
			throw new Error('Error fetching profile');
		}

		const data = await response.json(); // Correctly parse the JSON response
		setIsFollowerOfCreator(data.profile.followers.includes(Number(storedProfileId)));
	} catch (err) {
		console.error(err); // Log the error for debugging
	}
};