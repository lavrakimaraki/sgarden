// utils/api.js
export const userAPI = {
  // Get current user profile
  getProfile: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/user/decode/', {
      headers: {
        'x-access-token': token, // Changed from Authorization to x-access-token
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.response = { status: response.status };
      throw error;
    }
    
    return await response.json();
  },

  // Update profile (username/email)
  updateProfile: async (username, email) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'x-access-token': token, // Changed from Authorization to x-access-token
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email })
    });
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.response = response;
      throw error;
    }
    
    const data = await response.json();
    return data.user;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/user/password', {
      method: 'PUT',
      headers: {
        'x-access-token': token, // Changed from Authorization to x-access-token
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.response = response;
      throw error;
    }
    
    return await response.json();
  }
};
