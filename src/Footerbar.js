import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { logout,getProfile, getToken } from './services/authService';
import '@fortawesome/fontawesome-free/css/all.min.css'; 
import consumer from "./consumer"
import './Footerbar.css';

const Footerbar = ({ isLoggedIn, hasProfile, setIsLoggedIn, setHasProfile }) => {
	const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatNotifications, setChatNotifications] = useState([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const API_URL = 'http://localhost:4000'; // Replace this with your API's base route
  const token = getToken();

	const handleLogout = () => {
		logout();
		setIsLoggedIn(false);
		setHasProfile (false);
	};

	useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();

      // Optional: Set up WebSocket or similar for real-time updates.
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const fetchUnreadCount = (notifications) => {
    return notifications.reduce((count, notification) => {
      return notification.read ? count : count + 1;
    }, 0);
  };

  const fetchNotifications = async () => {
    try {
      if (!token) {
        throw new Error('Token is missing!');
      }

      console.log('Token being used:', token);

      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      const notifications = data.notifications.filter(notification => notification.category === "other" );
      const chat = data.notifications.filter(notification => notification.category === "chat" );
      const newNotifications = notifications || [];
      const newChat = chat || [];
      setNotifications(newNotifications);
      setChatNotifications(newChat);
      const unread = fetchUnreadCount(newNotifications);
      const unreadChat = fetchUnreadCount(newChat);
      setUnreadCount(unread);
      setUnreadChatCount(unreadChat);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    const subscription = consumer.subscriptions.create(
      { channel: 'NotificationsChannel' },
      {
        connected: () => { console.log('Connected to NotificationsChannel') },
        disconnected: () => { console.log('Disconnected from NotificationsChannel') },
        received: (newNotification) => {
          setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
          if (!newNotification.read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      }
    );

    // Fetch initial set of notifications on mount
    fetchNotifications();

    return () => {
      subscription.unsubscribe();
    };
  }, [API_URL, token]);
	
	return (
      <footer className="bg-light fixed-bottom">
          <nav className="navbar navbar-expand navbar-light container">
            <div className="navbar-collapse">
              <ul className="navbar-nav mx-auto">
                {isLoggedIn && (
                  <>
                    {hasProfile && (
                      <li className="nav-item mx-3">
                        <ProfileIcon />
                      </li>
                    )}
                    {hasProfile && (
                      <li className="nav-item mx-3">
                        <WalletIcon />
                      </li>
                    )}
                    {hasProfile && (
                      <li className="nav-item mx-3">
                        <ChatIcon unreadCount={unreadChatCount} />
                      </li>
                    )}
                    {hasProfile && (
                      <li className="nav-item mx-3">
                        <NotificationIcon unreadCount={unreadCount} />
                      </li>
                    )}
                    <li className="nav-item mx-3">
                      <Link className="nav-link" to="/login" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt mr-1"></i> Logout
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </nav>
        </footer>
	);

};


function WalletIcon() {
  return (
    <Link className="nav-link position-relative" to={`/wallet`}>
      <i className="fas fa-wallet"></i>
    </Link>
  );
}


function ProfileIcon() {
  return (
     <li className="nav-item">
      <Link className="nav-link position-relative" to={`/profile/${getProfile()}`}>
        <i className="fas fa-user-circle"></i>
      </Link>
    </li>
  );
}

function NotificationIcon({ unreadCount }) {
  return (
    <li className="nav-item">
      <Link className="nav-link position-relative" to="/notifications">
	       <i className="fas fa-bell"></i>
	       {unreadCount > 0 && (
	           <span className="badge badge-danger position-absolute top-0 start-100 translate-middle">
	               {unreadCount}
	           </span>
	       )}
	   </Link>
    </li>
  );
}

function ChatIcon({ unreadCount }) {
  return (
    <li className="nav-item">
      <Link className="nav-link position-relative" to="/notifications">
         <i className="fas fa-comments"></i>
         {unreadCount > 0 && (
             <span className="badge badge-danger position-absolute top-0 start-100 translate-middle">
                 {unreadCount}
             </span>
         )}
     </Link>
    </li>
  );
}

export default Footerbar;