import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('cinebook_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Movies
export const getMovies = () => API.get('/movies');
export const getMovieById = (id) => API.get(`/movies/${id}`);
export const createMovie = (data) => API.post('/movies', data);
export const updateMovie = (id, data) => API.put(`/movies/${id}`, data);
export const deleteMovie = (id) => API.delete(`/movies/${id}`);

// Shows
export const getShows = (params) => API.get('/shows', { params });
export const getShowById = (id) => API.get(`/shows/${id}`);
export const getShowSeats = (id) => API.get(`/shows/${id}/seats`);
export const createShow = (data) => API.post('/shows', data);
export const updateShow = (id, data) => API.put(`/shows/${id}`, data);
export const deleteShow = (id) => API.delete(`/shows/${id}`);

// Theatres
export const getTheatres = () => API.get('/theatres');
export const getTheatreById = (id) => API.get(`/theatres/${id}`);
export const getTheatreScreens = (id) => API.get(`/theatres/${id}/screens`);
export const createTheatre = (data) => API.post('/theatres', data);
export const updateTheatre = (id, data) => API.put(`/theatres/${id}`, data);
export const deleteTheatre = (id) => API.delete(`/theatres/${id}`);
export const createScreen = (theatreId, data) => API.post(`/theatres/${theatreId}/screens`, data);

// Screens / Seats
export const getScreenSeats = (screenId) => API.get(`/screens/${screenId}/seats`);

// Bookings
export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = () => API.get('/bookings/my');
export const getBookingById = (id) => API.get(`/bookings/${id}`);
export const cancelBooking = (id) => API.post(`/bookings/${id}/cancel`);

// Payments
export const createPaymentOrder = (data) => API.post('/payments/create-order', data);
export const verifyPayment = (data) => API.post('/payments/verify', data);

// Admin
export const getAdminDashboard = () => API.get('/admin/dashboard');
export const getAdminBookings = (params) => API.get('/admin/bookings', { params });

export default API;

