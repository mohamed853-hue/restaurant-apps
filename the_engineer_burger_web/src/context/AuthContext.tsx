import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Address, Notification } from '../types';
import { supabase, DEMO_USERS } from '../lib/supabase';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  addresses: Address[];
  notifications: Notification[];
  unreadCount: number;
  login: (email: string, password?: string) => Promise<boolean>;
  loginAsDemo: (role: UserRole) => void;
  register: (name: string, email: string, phone: string, password?: string) => Promise<boolean>;
  logout: () => void;
  addAddress: (address: Omit<Address, 'id' | 'user_id'>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  markNotificationsAsRead: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('engineer_burger_user');
    return saved ? JSON.parse(saved) : DEMO_USERS[0]; // Default to customer
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    if (user) {
      localStorage.setItem('engineer_burger_user', JSON.stringify(user));
      refreshUserData();
    } else {
      localStorage.removeItem('engineer_burger_user');
      setAddresses([]);
      setNotifications([]);
    }
  }, [user?.id]);

  const refreshUserData = async () => {
    if (!user) return;
    try {
      // Fetch addresses from Supabase or localStorage fallback
      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id);

      if (!addressError && addressData && addressData.length > 0) {
        setAddresses(addressData);
      } else {
        const localAddresses = localStorage.getItem(`addresses_${user.id}`);
        if (localAddresses) {
          setAddresses(JSON.parse(localAddresses));
        } else {
          setAddresses([
            {
              id: 'addr-1',
              user_id: user.id,
              label: 'Maison',
              address_line: 'Résidence Les Palmiers, Hydra',
              city: 'Alger',
              pincode: '16035',
              is_default: true
            }
          ]);
        }
      }

      // Fetch notifications
      const { data: notifData, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!notifError && notifData && notifData.length > 0) {
        setNotifications(notifData);
      } else {
        setNotifications([
          {
            id: 'n1',
            user_id: user.id,
            title: 'Bienvenue chez The Engineer Burger ! 🍔',
            message: 'Profitez de 300 DA de réduction avec le code WELCOME300.',
            icon: 'bi-stars',
            is_read: false,
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (e) {
      console.warn('Using local state for user data', e);
    }
  };

  const login = async (email: string, _password?: string): Promise<boolean> => {
    try {
      // Check in Supabase first
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .single();

      if (!error && data) {
        setUser(data);
        addToast('success', `Bon retour parmi nous, ${data.name} !`);
        return true;
      }
    } catch (err) {
      console.warn('Supabase query fallback', err);
    }

    // Fallback to local demo users
    const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (matched) {
      setUser(matched);
      addToast('success', `Bon retour, ${matched.name} ! (${matched.role})`);
      return true;
    }

    // Default create custom user
    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: email.split('@')[0],
      email: email.trim().toLowerCase(),
      role: 'customer',
      status: 'active'
    };
    setUser(newUser);
    addToast('success', `Connecté avec succès en tant que ${newUser.name}`);
    return true;
  };

  const loginAsDemo = (role: UserRole) => {
    const demo = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
    setUser(demo);
    addToast('info', `Connecté en mode Démo : ${demo.name} (${role.toUpperCase()})`);
  };

  const register = async (name: string, email: string, phone: string, _password?: string): Promise<boolean> => {
    const newUser: User = {
      id: 'usr-' + Date.now(),
      name,
      email: email.trim().toLowerCase(),
      phone,
      role: 'customer',
      status: 'active'
    };

    try {
      await supabase.from('users').insert([newUser]);
    } catch (e) {
      console.warn('User registered in local state', e);
    }

    setUser(newUser);
    addToast('success', `Bienvenue chez The Engineer Burger, ${name} !`);
    return true;
  };

  const logout = () => {
    setUser(null);
    addToast('info', 'Vous avez été déconnecté.');
  };

  const addAddress = async (address: Omit<Address, 'id' | 'user_id'>) => {
    if (!user) return;
    const newAddr: Address = {
      ...address,
      id: 'addr-' + Date.now(),
      user_id: user.id
    };

    const updated = [...addresses.map((a) => (address.is_default ? { ...a, is_default: false } : a)), newAddr];
    setAddresses(updated);
    localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));

    try {
      await supabase.from('addresses').insert([newAddr]);
    } catch (e) {
      console.warn('Address saved locally', e);
    }
    addToast('success', 'Adresse enregistrée avec succès.');
  };

  const deleteAddress = async (id: string) => {
    if (!user) return;
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));

    try {
      await supabase.from('addresses').delete().eq('id', id);
    } catch (e) {
      console.warn('Address deleted locally', e);
    }
    addToast('info', 'Adresse supprimée.');
  };

  const markNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    if (user) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
      } catch (e) {
        console.warn('Notifications marked read locally', e);
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        addresses,
        notifications,
        unreadCount,
        login,
        loginAsDemo,
        register,
        logout,
        addAddress,
        deleteAddress,
        markNotificationsAsRead,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
