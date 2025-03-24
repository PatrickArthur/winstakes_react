import React from 'react';
import ProfilesFeed from './profiles/ProfilesFeed';

const Home = ({setHasProfile}) => {

	const profileId = localStorage.getItem('profile_id');
    if (profileId) {
      setHasProfile(true);
    }
    
	return (
		 <div>
	      <ProfilesFeed/>
	    </div>
	);
};

export default Home;