import { jwt } from "./index.js";

// utils/api.js
export const userAPI = {
  // Get current user profile
  getProfile: async () => {
    const token = jwt.getToken();
    if (!token) {
      const error = new Error("No token found");
      error.response = { status: 401 };
      throw error;
    }

    const response = await fetch('/api/user/decode/', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'x-access-token': token,
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
    const token = jwt.getToken();
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'x-access-token': token,
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
    const token = jwt.getToken();
    const response = await fetch('/api/user/password', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'x-access-token': token,
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

// Activity tracking API
export const activityAPI = {
  // Log a dashboard view
  logDashboardView: async (dashboardPath) => {
    try {
      const token = jwt.getToken();
      if (!token) return;
      
      await fetch('/api/activity/log', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'x-access-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          actionType: 'dashboard_view',
          details: { dashboard: dashboardPath }
        })
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
};
