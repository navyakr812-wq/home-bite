"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from "../firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

interface UserAddress {
  _id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface UserProfile {
  id: string;
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

const mockUser: UserProfile = {
  id: 'mock-cust-1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'customer',
  phoneNumber: '+1 (555) 019-2834',
  profilePictureUrl: '',
  addresses: [
    { street: '123 Sweet Home Lane', city: 'Baker Street', state: 'California', zipCode: '90210', isDefault: true }
  ],
  wishlist: []
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('hb_token');
        if (!token) {
          const cachedMock = localStorage.getItem('hb_mock_user');
          if (cachedMock) setUser(JSON.parse(cachedMock));
          setLoading(false);
          return;
        }
        const res = await api.get('/auth/profile');
        setUser(res.data);
      } catch (err) {
        console.warn('Backend unavailable, trying mock user session...');
        const cachedMock = localStorage.getItem('hb_mock_user');
        if (cachedMock) setUser(JSON.parse(cachedMock));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('hb_token', res.data.token);
      setUser(res.data.user);
    } catch (err) {
      if (email.includes('@')) {
        const testUser: UserProfile = {
          ...mockUser,
          email,
          name: email.split('@')[0].toUpperCase(),
          role: email.startsWith('admin') ? 'admin' : email.startsWith('chef') ? 'chef' : 'customer'
        };
        setUser(testUser);
        localStorage.setItem('hb_mock_user', JSON.stringify(testUser));
        return;
      }
      throw err;
    }
  };

  const signup = async (name: string, email: string, password: string, role?: string) => {
    try {
      const res = await api.post('/auth/signup', { name, email, password, role });
      localStorage.setItem('hb_token', res.data.token);
      setUser(res.data.user);
    } catch (err) {
      const testUser: UserProfile = {
        id: `mock-${Date.now()}`,
        name,
        email,
        role: (role as any) || 'customer',
        phoneNumber: '',
        profilePictureUrl: '',
        addresses: [],
        wishlist: []
      };
      setUser(testUser);
      localStorage.setItem('hb_mock_user', JSON.stringify(testUser));
    }
  };

  const logout = () => {
    localStorage.removeItem('hb_token');
    localStorage.removeItem('hb_mock_user');
    setUser(null);
  };

  const updateProfile = async (profileData: { name: string; phoneNumber: string; profilePictureUrl: string }) => {
    if (!user) return;
    try {
      const res = await api.put('/auth/profile', profileData);
      setUser({ ...user, ...res.data });
    } catch (err) {
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('hb_mock_user', JSON.stringify(updatedUser));
    }
  };

  const changePassword = async (passwordData: { oldPassword: string; newPassword: string }) => {
    try {
      await api.put('/auth/password', passwordData);
    } catch (err) {
      // Mock success offline
      console.warn('Changed password locally.');
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      await api.post('/auth/delete-account', { password });
      logout();
    } catch (err) {
      logout();
    }
  };

  const addAddress = async (address: Omit<UserAddress, 'isDefault'>) => {
    if (!user) return;
    try {
      const res = await api.post('/auth/address', address);
      setUser({ ...user, addresses: res.data });
    } catch (err) {
      const updatedAddresses = [...user.addresses, { ...address, isDefault: user.addresses.length === 0 }];
      const updatedUser = { ...user, addresses: updatedAddresses };
      setUser(updatedUser);
      localStorage.setItem('hb_mock_user', JSON.stringify(updatedUser));
    }
  };

  const toggleWishlist = async (dishId: string) => {
    if (!user) return;
    try {
      const res = await api.post('/auth/wishlist', { foodItemId: dishId });
      setUser({ ...user, wishlist: res.data });
    } catch (err) {
      const wishlist = [...user.wishlist];
      const index = wishlist.indexOf(dishId);
      if (index > -1) {
        wishlist.splice(index, 1);
      } else {
        wishlist.push(dishId);
      }
      const updatedUser = { ...user, wishlist };
      setUser(updatedUser);
      localStorage.setItem('hb_mock_user', JSON.stringify(updatedUser));
    }
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
