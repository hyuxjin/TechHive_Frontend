import axios from 'axios';

// Create an Axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: 'https://techhivebackend-production-86d4.up.railway.app',
  withCredentials: true, // Enable sending cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to handle different request types
axiosInstance.interceptors.request.use(
  (config) => {
    // Handle blob requests differently
    if (config.responseType === 'blob') {
      config.headers['Accept'] = 'application/octet-stream';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle responses and errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    // Handle blob responses
    if (response.config.responseType === 'blob' && response.data.size === 0) {
      return Promise.reject(new Error('No content'));
    }
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.error("Unauthorized! Redirecting to login...");
      // Clean up any stored auth data
      localStorage.removeItem('loggedInUser');
      window.location.href = "/signin";
    } 
    else if (error.response?.status === 403) {
      console.error("Access denied! Redirecting to unauthorized page...");
      window.location.href = "/unauthorized";
    }
    // Handle blob errors
    else if (error.config?.responseType === 'blob' && error.response?.data) {
      // Convert blob error to json error
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            error.response.data = errorData;
            reject(error);
          } catch (e) {
            reject(error);
          }
        };
        reader.onerror = () => {
          reject(error);
        };
        reader.readAsText(error.response.data);
      });
    }
    // Log all other errors
    else {
      console.error("An error occurred:", error.response?.data || error.message);
      // If it's a network error, show a user-friendly message
      if (!error.response) {
        console.error("Network error. Please check your connection.");
      }
    }

    return Promise.reject(error);
  }
);

// Add helper method for profile picture requests
axiosInstance.getProfilePicture = async (userId, userRole = 'user') => {
  try {
    const response = await axiosInstance.get(
      `/profile/${userRole}/getProfilePicture/${userId}`,
      {
        responseType: 'blob'
      }
    );
    
    if (response.data.size > 0) {
      return URL.createObjectURL(response.data);
    }
    return null;
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    return null;
  }
};

export default axiosInstance;