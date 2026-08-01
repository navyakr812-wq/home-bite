"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

export interface UserAddress {
  _id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'customer' | 'chef' | 'admin';
  phoneNumber: string;
  profilePictureUrl: string;
  addresses: UserAddress[];
  wishlist: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: { name: string; phoneNumber: string; profilePictureUrl: string }) => Promise<void>;
  changePassword: (passwordData: { oldPassword: string; newPassword: string }) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  addAddress: (address: Omit<UserAddress, 'isDefault'>) => Promise<void>;
  toggleWishlist: (dishId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('hb_token');
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await api.get('/auth/profile');
        setUser(res.data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        localStorage.removeItem('hb_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('hb_token', res.data.token);
    setUser(res.data.user);
  };

  const signup = async (name: string, email: string, password: string, role?: string) => {
    const res = await api.post('/auth/signup', { name, email, password, role });
    localStorage.setItem('hb_token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('hb_token');
    setUser(null);
  };

  const updateProfile = async (profileData: { name: string; phoneNumber: string; profilePictureUrl: string }) => {
    if (!user) return;
    const res = await api.put('/auth/profile', profileData);
    setUser({ ...user, ...res.data });
  };

  const changePassword = async (passwordData: { oldPassword: string; newPassword: string }) => {
    await api.put('/auth/password', passwordData);
  };

  const deleteAccount = async (password: string) => {
    await api.post('/auth/delete-account', { password });
    logout();
  };

  const addAddress = async (address: Omit<UserAddress, 'isDefault'>) => {
    if (!user) return;
    const res = await api.post('/auth/address', address);
    setUser({ ...user, addresses: res.data });
  };

  const toggleWishlist = async (dishId: string) => {
    if (!user) return;
    const res = await api.post('/auth/wishlist', { foodItemId: dishId });
    setUser({ ...user, wishlist: res.data });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile, changePassword, deleteAccount, addAddress, toggleWishlist }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
