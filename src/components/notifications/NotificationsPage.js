 import React, {useState, useEffect} from 'react';
 import consumer from '../../consumer';
 import { getToken } from '../../services/authService';

 const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const API_URL = 'http://localhost:4000'; // Replace this with your API's base route
  const token = getToken();
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  useEffect(() => {
    fetch(`${API_URL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
    .then(response => response.json())
    .then(data => {
        const notifications = data.notifications.filter(notification => notification.category === "other" );
        setNotifications(notifications);
        setUnreadCount(notifications.filter(notification => !notification.read).length);
    });

   const subscription = consumer.subscriptions.create(
    { channel: 'NotificationsChannel' }, 
         {
           received(data) {
             setNotifications(prevNotifications => [data.notification, ...prevNotifications]);
             setUnreadCount(prevUnreadCount => prevUnreadCount + 1);
           }
         }
       );

       return () => {
         subscription.unsubscribe();
       };
    }, []);

  const markAsRead = (id) => {
       fetch(`${API_URL}/notifications/${id}/mark_as_read`, {
         method: 'PATCH',
         headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json'
         }
       })
       .then(() => {
         setNotifications(notifications.map(notification =>
           notification.id === id ? { ...notification, read: true } : notification
         ));
         setUnreadCount(notifications.reduce((count, notification) => (notification.read ? count : count + 1), 0));
       });
     };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const NotificationItem = ({ notification }) => (
    <li key={notification.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
      <img src={`${API_URL}${notification.photo_url}`} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} />
      <div>
        <p style={{ margin: '0', fontWeight: notification.read ? 'normal' : 'bold' }}>{notification.message}</p>
        <small style={{ color: 'gray' }}>{formatDate(notification.createdAt)}</small>
        {!notification.read && 
          <button onClick={() => markAsRead(notification.id)} style={{ marginLeft: '10px', cursor: 'pointer', background: '#f0f0f0', border: 'none', padding: '5px 10px', borderRadius: '5px' }}>
            Mark as read
          </button>
        }
      </div>
    </li>
  );

  console.log(notifications)
  return (
    <div>
      {unreadNotifications.length > 0 && (
        <div>
          <h3>Unread Notifications</h3>
          <ul style={{ listStyle: 'none', padding: '0' }}>
            {unreadNotifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </ul>
        </div>
      )}

      {readNotifications.length > 0 && (
        <div>
          <h3>Read Notifications</h3>
          <ul style={{ listStyle: 'none', padding: '0' }}>
            {readNotifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

  export default NotificationsPage;