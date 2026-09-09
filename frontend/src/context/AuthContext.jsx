import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cinebook_token');
    if (token) {
      getMe()
        .then((res) => setUser(res.data.data))
        .catch(() => localStorage.removeItem('cinebook_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    const { user, token } = res.data.data;
    localStorage.setItem('cinebook_token', token);
    setUser(user);
    return user;
  };

  const register = async (formData) => {
    const res = await apiRegister(formData);
    const { user, token } = res.data.data;
    localStorage.setItem('cinebook_token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('cinebook_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

