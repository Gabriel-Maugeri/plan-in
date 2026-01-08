import { createContext, useContext, useState, useEffect } from 'react';
import { securityAPI } from '../services/api';
import { encryptPassword } from '../utils/encryption';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('auth');
    
    if (authToken) {
      setToken(authToken);
      localStorage.setItem('token', authToken);
      
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } else {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const encryptedPassword = encryptPassword(credentials.password);
      
      const encryptedCredentials = {
        documentNumber: credentials.documentNumber,
        userName: credentials.userName,
        passwordHash: encryptedPassword,
        forceSingIn: credentials.forceSingIn
      };
      
      const response = await securityAPI.authenticate(encryptedCredentials);
      
      // Check for password expired scenario (temporary - API response structure TBD)
      if (response.passwordExpired || response.status === 'PASSWORD_EXPIRED') {
        return { 
          success: false, 
          passwordExpired: true,
          error: 'Contraseña vencida'
        };
      }
      
      // Check for email not verified scenario (temporary - API response structure TBD)
      if (response.emailNotVerified || response.status === 'EMAIL_NOT_VERIFIED') {
        return { 
          success: false, 
          emailNotVerified: true,
          email: response.email || response.emailAddress || '',
          error: 'Email no verificado'
        };
      }
      
      const tokenValue = response.tokenAccess;
      
      const [userId, userSubId, name, uuid] = response.value.split('|');
      
      const userData = {
        userId: parseInt(userId),
        userSubId: parseInt(userSubId),
        name: name,
        uuid: uuid,
        documentNumber: credentials.documentNumber,
        userName: credentials.userName,
      };
      
      localStorage.setItem('token', tokenValue);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(tokenValue);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await securityAPI.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
