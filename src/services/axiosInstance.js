import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080', // Replace with your backend's base URL
  withCredentials: true, // Enable sending cookies with requests
});

// Add a response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    // Pass successful responses as is
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized! Redirecting to login...");
      // Optionally redirect the user to the login page
      window.location.href = "/signin"; // Adjust the path as per your login route
    } else if (error.response?.status === 403) {
      console.error("Access denied! Redirecting to unauthorized page...");
      // Redirect to an unauthorized access page
      window.location.href = "/unauthorized"; // Adjust as needed
    } else {
      // Log other errors for debugging
      console.error("An error occurred:", error.response?.data || error.message);
    }
    return Promise.reject(error); // Pass the error for further handling if needed
  }
);

export default axiosInstance;
