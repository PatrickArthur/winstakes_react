import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getChat, createMessage } from '../../chatService';
import cable from '../../consumer';

const Chat = ( {chatId} ) => {
  const { id } = chatId
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const cableSub = useRef(null);

  const API_URL = 'http://localhost:4000'; // Replace this with your API's base route

  useEffect(() => {
    if (chatId) {
      fetchChat();
      setupSubscription();
    }
    return () => {
      if (cableSub.current) {
        cableSub.current.unsubscribe();
      }
    };
  }, [id]);

  const fetchChat = async () => {
    const response = await getChat(chatId);
    setChat(response.chat);
    setMessages(response.chat.messages);
  };

  const setupSubscription = () => {
    cableSub.current = cable.subscriptions.create(
      { channel: 'ChatChannel', chat_id: chatId},
      {
        received: (data) => {
          setMessages((prevMessages) => [...prevMessages, data]);
        },
      }
    );
  };

  const handleSendMessage = async () => {
    console.log(newMessage)
    await createMessage(chatId, newMessage);
    setNewMessage('');
  };

  return chat ? (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Chat: {chat.id}</h1>
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={`${API_URL}${chat.user2.photo_url}`}
          alt={chat.user2.id}
          className="profile-image"
          style={{ width: "50px", height: "50px", borderRadius: "50%", marginRight: "10px" }}
        />
        <p style={{ margin: 0, fontWeight: "bold" }}>{chat.user2.email}</p>
      </div>
      
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {messages.map((msg) => (
          <li key={msg.id} style={{ margin: "10px 0", padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
              <img
                src={`${API_URL}${msg.user_id === chat.user1.id ? chat.user1.photo_url : chat.user2.photo_url}`}
                alt={`User ${msg.user_id}`}
                style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
              />
              <span style={{ fontWeight: "bold" }}>{msg.user_id === chat.user2.id ? chat.user2.email : "You"}</span>
            </div>
            <p style={{ margin: 0 }}>{msg.context}</p>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "20px", display: "flex" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ flexGrow: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
        />
        <button
          onClick={handleSendMessage}
          style={{ marginLeft: "10px", padding: "8px 12px", backgroundColor: "#1DA1F2", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Send
        </button>
      </div>
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default Chat;