/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { api } from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.auth.me();
      
      if (response.data.user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.user });
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    }
  };

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.auth.login({ email, password });
      
      if (response.data.token && response.data.user) {
        const { token, user } = response.data;
        Cookies.set('token', token, { expires: 7 });
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        return { success: true };
      } else {
        // This should rarely happen as the server should return user and token or throw an error
        dispatch({ type: 'SET_LOADING', payload: false });
        return {
          success: false,
          message: 'Invalid credentials. Please try again.'
        };
      }
    } catch (error) {
      console.error('Login error:', error?.response?.data || error.message);
      dispatch({ type: 'SET_LOADING', payload: false });
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid email or password. Please try again.',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.auth.register(userData);
      
      if (response.data.token && response.data.user) {
        const { token, user } = response.data;
        Cookies.set('token', token, { expires: 7 });
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    Cookies.remove('token');
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
