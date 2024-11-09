import axios from 'axios'
import Cookies from 'js-cookie';
import { setToken } from '../redux/features/userSlice';
import store from '../redux/app/store';

const instance = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});



instance.interceptors.response.use(
  (response) => response,
  async (error) => {

    console.log('reached here')
    
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await instance.post('/refresh-token', {}, { withCredentials: true });

        console.log(response)

        if (response.data.newAccessToken) {
          Cookies.set('accessToken', response.data.newAccessToken, { path: '/', sameSite: 'None', secure: true });
          originalRequest.headers['Authorization'] = `Bearer ${response.data.newAccessToken}`;
          store.dispatch(setToken({ token: response.data.newAccessToken }));
          return instance(originalRequest);
        }



      } catch (refreshError) {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
      }
    }
    else if (error.response.status === 402 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await instance.post('/admin/refresh-token', {}, { withCredentials: true });

        console.log(response)

        if (response.data.newAdminAccessToken) {
          Cookies.set('AdminAccessToken', response.data.newAdminAccessToken, { path: '/', sameSite: 'None', secure: true });
          originalRequest.headers['Authorization'] = `Bearer ${response.data.newAdminAccessToken}`;

          return instance(originalRequest);
        }



      } catch (refreshError) {
        Cookies.remove('AdminAccessToken');
        Cookies.remove('AdminRefreshToken');
        window.location.href = '/admin/login';
      }
    }

    return Promise.reject(error);
  }
);

export default instance