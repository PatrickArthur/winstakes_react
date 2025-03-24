import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000', // Modify to your rails server URL
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  // Add authorization token here if needed
  config.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
  return config;
});

const handleApiError = (error) => {
  if (axios.isAxiosError(error)) {
    // Axios-specific error handling
    if (error.response) {
      // Server responded with a status other than 2xx
      const { status, data } = error.response;
      
      if (status === 403) {
        // Handle 403 Forbidden error specifically
        console.error('Access Forbidden:', data);
         window.location.href = '/'
      } else {
        // Handle other statuses
        console.error('API Error:', data);
      }
    } else if (error.request) {
      // Request was made but no response was received
      console.error('No response from API:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('API Request Error:', error.message);
    }
  } else {
    // Non-axios related errors
    console.error('Unexpected Error:', error);
  }
};

export const getChats = () => api.get('/chats');
export const createChat = (user2_id) => api.post('/chats', { user2_id });
export const getChat = async (id) => {
  try {
    const response = await api.get(`/chats/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error; // Rethrow the error for further handling if necessary
  }
};
export const createMessage = async (chatId, content) => {
  return await api.post(`/chats/${chatId}/messages`, {
       "message": {
         "context": content
       }
     });
};
export const fetchUsers = () => api.get(`/home`);

