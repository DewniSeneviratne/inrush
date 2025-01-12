import axios from "axios";

//axios instance
const axiosInstance = axios.create({
  baseURL: 'https://localhost:44364', 
  withCredentials: true,
});


export default axiosInstance;
