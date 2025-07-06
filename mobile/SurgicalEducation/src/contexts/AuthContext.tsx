import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_AUDIENCE } from '../constants/config';
import { User, AuthState } from '../types';
import api from '../services/api';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const redirectUri = AuthSession.makeRedirectUri({});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const discovery = AuthSession.useAutoDiscovery(`https://${AUTH0_DOMAIN}`);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: AUTH0_CLIENT_ID,
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      extraParams: {
        audience: AUTH0_AUDIENCE,
      },
    },
    discovery
  );

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      handleAuthResponse(response.params.code);
    }
  }, [response]);

  const loadStoredAuth = async () => {
    try {
      const [accessToken, refreshToken, userJson] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('refreshToken'),
        AsyncStorage.getItem('user'),
      ]);

      if (accessToken && userJson) {
        const user = JSON.parse(userJson);
        setAuthState({
          user,
          accessToken,
          refreshToken,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleAuthResponse = async (code: string) => {
    try {
      // Exchange code for tokens using your backend
      const response = await api.login(code, 'auth0');
      
      const { access_token, refresh_token, user } = response;

      await Promise.all([
        AsyncStorage.setItem('accessToken', access_token),
        AsyncStorage.setItem('refreshToken', refresh_token),
        AsyncStorage.setItem('user', JSON.stringify(user)),
      ]);

      setAuthState({
        user,
        accessToken: access_token,
        refreshToken: refresh_token,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Auth error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async () => {
    if (AUTH0_DOMAIN && AUTH0_CLIENT_ID) {
      // Use Auth0 authentication
      await promptAsync();
    } else {
      // Fallback to demo mode
      console.warn('Auth0 not configured, using demo mode');
      const demoUser: User = {
        id: 'demo-user',
        email: 'demo@surgicaledu.com',
        name: 'Demo User',
        role: 'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(demoUser));
      setAuthState({
        user: demoUser,
        accessToken: 'demo-token',
        refreshToken: null,
        isLoading: false,
        isAuthenticated: true,
      });
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('accessToken'),
        AsyncStorage.removeItem('refreshToken'),
        AsyncStorage.removeItem('user'),
      ]);

      setAuthState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
      });

      // Clear Auth0 session
      if (AUTH0_DOMAIN) {
        await WebBrowser.openAuthSessionAsync(
          `https://${AUTH0_DOMAIN}/v2/logout?client_id=${AUTH0_CLIENT_ID}&returnTo=${redirectUri}`,
          redirectUri
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshAuth = async () => {
    if (!authState.refreshToken) return;

    try {
      const response = await api.refreshToken(authState.refreshToken);
      const { access_token, refresh_token } = response;

      await Promise.all([
        AsyncStorage.setItem('accessToken', access_token),
        AsyncStorage.setItem('refreshToken', refresh_token),
      ]);

      setAuthState(prev => ({
        ...prev,
        accessToken: access_token,
        refreshToken: refresh_token,
      }));
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};