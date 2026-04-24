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

// Activity tracking API
export const activityAPI = {
  // Log a dashboard view
  logDashboardView: async (dashboardPath) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; // Don't log if not authenticated
      
      await fetch('/api/activity/log', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          actionType: 'dashboard_view',
          details: { dashboard: dashboardPath }
        })
      });
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw - silently fail to not disrupt user experience
    }
  }
};
