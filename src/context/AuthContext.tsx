import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/inventory';
import { INITIAL_USERS } from '../data/initialData';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isDexterAccount: boolean;
  isAlexAccount: boolean;
  login: (emailOrLoginId: string, password?: string) => Promise<boolean>;
  signup: (name: string, email: string, role: UserRole, warehouseId: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  availableUsers: User[];
  // OTP Password Reset Flow
  requestPasswordResetOtp: (email: string) => Promise<{ success: boolean; simulatedOtp: string }>;
  verifyOtpAndResetPassword: (email: string, otp: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'stocksense_auth_user_v2';
const USERS_STORAGE_KEY = 'stocksense_registered_users_v2';

export const checkIsDexterAccount = (user: User | null): boolean => {
  if (!user) return false;
  const name = user.name.toLowerCase();
  const email = user.email.toLowerCase();
  return (
    user.id === 'usr-1' ||
    name.includes('dexter') ||
    email.includes('dexter') ||
    name.includes('alex') ||
    email.includes('alex')
  );
};

export const checkIsAlexAccount = checkIsDexterAccount;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse stored users', e);
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          // If stored user was the old Alex account, automatically upgrade name to Dexter Morgan
          if (parsed.id === 'usr-1' || parsed.email.includes('alex.morgan')) {
            return {
              ...parsed,
              name: 'Dexter Morgan',
              email: 'dexter.morgan@stocksense.io'
            };
          }
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse stored auth user', e);
      }
    }
    // Default to Dexter Morgan (Demo Account)
    return INITIAL_USERS[0];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const login = async (identifier: string, _password?: string): Promise<boolean> => {
    const clean = identifier.trim().toLowerCase();
    if (!clean) return false;

    // Look for matching user by email, exact name, or slug
    const user = users.find(u => {
      const email = u.email.toLowerCase();
      const name = u.name.toLowerCase();
      const slug = name.replace(/\s+/g, '.');
      const emailPrefix = email.split('@')[0];
      return (
        email === clean ||
        name === clean ||
        slug === clean ||
        emailPrefix === clean ||
        (!clean.includes('@') && email === `${clean}@stocksense.io`)
      );
    });

    if (user) {
      setCurrentUser(user);
      return true;
    }

    return false;
  };

  const signup = async (
    name: string,
    email: string,
    role: UserRole,
    warehouseId: string
  ): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check if user already exists
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      const updatedUser: User = {
        ...existing,
        name: cleanName || existing.name,
        role, // role directly determined through signup
        title: role === 'inventory_manager' ? 'Inventory Manager' : 'Warehouse Staff',
        warehouseId: warehouseId || existing.warehouseId || 'wh-northdock'
      };
      setUsers(prev => prev.map(u => (u.id === existing.id ? updatedUser : u)));
      setCurrentUser(updatedUser);
      return true;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role, // directly determined through registration!
      title: role === 'inventory_manager' ? 'Inventory Manager' : 'Warehouse Staff',
      warehouseId: warehouseId || 'wh-northdock',
      avatarUrl: '/src/assets/images/stocksense_user_avatar_1790401027960.jpg'
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (!currentUser) return;
    // Only the Dexter Morgan demo account has the switching option for demonstration purposes!
    if (!checkIsDexterAccount(currentUser)) {
      console.warn('Role switching is reserved for the Dexter Morgan demo account.');
      return;
    }

    const updated: User = {
      ...currentUser,
      role: newRole,
      title: newRole === 'inventory_manager' ? 'Operations lead' : 'Warehouse Specialist'
    };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const requestPasswordResetOtp = async (email: string): Promise<{ success: boolean; simulatedOtp: string }> => {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await new Promise(r => setTimeout(r, 350));
    return { success: true, simulatedOtp: generatedOtp };
  };

  const verifyOtpAndResetPassword = async (
    email: string,
    otp: string,
    _newPassword: string
  ): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 300));
    if (otp && otp.length === 6) {
      const clean = email.trim().toLowerCase();
      const user =
        users.find(u => u.email.toLowerCase() === clean) ||
        users.find(u => u.name.toLowerCase().replace(/\s+/g, '.') === clean) ||
        users[0];
      if (user) {
        setCurrentUser(user);
        return true;
      }
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isDexterAccount: checkIsDexterAccount(currentUser),
        isAlexAccount: checkIsDexterAccount(currentUser),
        login,
        signup,
        logout,
        switchRole,
        switchUser,
        availableUsers: users,
        requestPasswordResetOtp,
        verifyOtpAndResetPassword
      }}
    >
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
