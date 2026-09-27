import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Address, Notification } from '../types';
import { supabase, DEMO_USERS } from '../lib/supabase';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  allUsers: User[];
  addresses: Address[];
  notifications: Notification[];
  unreadCount: number;
  login: (email: string, password?: string) => Promise<User | null>;
  register: (name: string, email: string, phone: string, password?: string, address?: string) => Promise<User | null>;
  registerStaff: (name: string, email: string, phone: string, role: UserRole, password?: string, address?: string) => Promise<User | null>;
  logout: () => void;
  addAddress: (address: Omit<Address, 'id' | 'user_id'>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  markNotificationsAsRead: () => Promise<void>;
  sendNotification: (userId: string, title: string, message: string, icon?: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  refreshAllUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('amitie_restaurant_user') || localStorage.getItem('engineer_burger_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('amitie_restaurant_all_users') || localStorage.getItem('engineer_burger_all_users');
    return saved ? JSON.parse(saved) : DEMO_USERS;
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem('amitie_restaurant_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('amitie_restaurant_user', JSON.stringify(user));
      refreshUserData();
    } else {
      localStorage.removeItem('amitie_restaurant_user');
      setAddresses([]);
      setNotifications([]);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshAllUsers();
  }, []);

  const refreshAllUsers = async () => {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        // Merge with demo users
        const map = new Map<string, User>();
        DEMO_USERS.forEach((u) => map.set(u.email.toLowerCase(), u));
        data.forEach((u: User) => map.set(u.email.toLowerCase(), u));
        allUsers.forEach((u) => {
          if (!map.has(u.email.toLowerCase())) map.set(u.email.toLowerCase(), u);
        });
        const combined = Array.from(map.values());
        setAllUsers(combined);
        localStorage.setItem('amitie_restaurant_all_users', JSON.stringify(combined));
      }
    } catch (e) {
      console.warn('Could not fetch all users from Supabase', e);
    }
  };

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
        const localAddresses = localStorage.getItem(`amitie_addresses_${user.id}`);
        if (localAddresses) {
          setAddresses(JSON.parse(localAddresses));
        } else {
          setAddresses([
            {
              id: '00000000-0000-0000-0000-' + String(Date.now()).slice(-12).padStart(12, '0'),
              user_id: user.id,
              label: 'Maison',
              address_line: user.address || 'Quartier Amitié',
              city: 'Amitié',
              pincode: '00000',
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
        const localNotifs = localStorage.getItem(`amitie_notifs_${user.id}`);
        if (localNotifs) {
          setNotifications(JSON.parse(localNotifs));
        } else {
          setNotifications([
            {
              id: 'n1',
              user_id: user.id,
              title: "Bienvenue chez Restaurant l'Amitié ! 🍲",
              message: 'Profitez de 1 000 FCFA de réduction dès 6 000 FCFA avec le code BIENVENUE1000.',
              icon: 'bi-stars',
              is_read: false,
              created_at: new Date().toISOString()
            }
          ]);
        }
      }
    } catch (e) {
      console.warn('Using local state for user data', e);
    }
  };

  const login = async (email: string, password?: string): Promise<User | null> => {
    const cleanEmail = email.trim().toLowerCase();

    // Check in Supabase first
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (!error && data) {
        setUser(data);
        addToast('success', `Bon retour parmi nous, ${data.name} !`);
        return data;
      }
    } catch (err) {
      console.warn('Supabase login check', err);
    }

    // Check in allUsers list (including Demo and locally registered users)
    const matched = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (matched) {
      setUser(matched);
      addToast('success', `Bon retour, ${matched.name} !`);
      return matched;
    }

    // Check in DEMO_USERS
    const demo = DEMO_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
    if (demo) {
      setUser(demo);
      addToast('success', `Bon retour, ${demo.name} !`);
      return demo;
    }

    // Default create custom customer user
    const newUser: User = {
      id: '00000000-0000-0000-0000-' + String(Date.now()).slice(-12).padStart(12, '0'),
      name: email.split('@')[0],
      email: cleanEmail,
      role: 'customer',
      status: 'active',
      orders_count: 0,
      total_spent: 0,
      created_at: new Date().toISOString()
    };

    setAllUsers((prev) => [newUser, ...prev]);
    setUser(newUser);
    addToast('success', `Connecté avec succès en tant que ${newUser.name}`);
    return newUser;
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password?: string,
    address?: string
  ): Promise<User | null> => {
    const cleanEmail = email.trim().toLowerCase();
    const safeId = '00000000-0000-0000-0000-' + String(Date.now()).slice(-12).padStart(12, '0');

    const newUser: User = {
      id: safeId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      address: address?.trim() || 'Quartier Amitié',
      role: 'customer',
      status: 'active',
      password: password || '123456',
      orders_count: 0,
      total_spent: 0,
      created_at: new Date().toISOString()
    };

    const updatedUsers = [newUser, ...allUsers.filter((u) => u.email.toLowerCase() !== cleanEmail)];
    setAllUsers(updatedUsers);
    localStorage.setItem('amitie_restaurant_all_users', JSON.stringify(updatedUsers));
    setUser(newUser);

    try {
      await supabase.from('users').upsert([newUser], { onConflict: 'email' });
    } catch (e) {
      console.warn('User registered locally', e);
    }

    addToast('success', `Bienvenue chez Restaurant l'Amitié, ${name} !`);
    return newUser;
  };

  const registerStaff = async (
    name: string,
    email: string,
    phone: string,
    role: UserRole,
    password?: string,
    address?: string
  ): Promise<User | null> => {
    const cleanEmail = email.trim().toLowerCase();
    const safeId = '00000000-0000-0000-0000-' + String(Date.now()).slice(-12).padStart(12, '0');

    const newStaff: User = {
      id: safeId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      address: address?.trim() || 'Ouargla',
      role,
      status: 'active',
      password: password || '123456',
      orders_count: 0,
      total_spent: 0,
      created_at: new Date().toISOString()
    };

    const updatedUsers = [newStaff, ...allUsers.filter((u) => u.email.toLowerCase() !== cleanEmail)];
    setAllUsers(updatedUsers);
    localStorage.setItem('amitie_restaurant_all_users', JSON.stringify(updatedUsers));

    try {
      await supabase.from('users').upsert([newStaff], { onConflict: 'email' });
    } catch (e) {
      console.warn('Staff registered locally', e);
    }

    addToast('success', `Compte ${role.toUpperCase()} "${name}" créé avec succès !`);
    return newStaff;
  };

  const logout = () => {
    setUser(null);
    addToast('info', 'Vous avez été déconnecté.');
  };

  const addAddress = async (address: Omit<Address, 'id' | 'user_id'>) => {
    if (!user) return;
    const safeId = '00000000-0000-0000-0000-' + String(Date.now()).slice(-12).padStart(12, '0');
    const newAddr: Address = {
      ...address,
      id: safeId,
      user_id: user.id
    };

    const updated = [...addresses.map((a) => (address.is_default ? { ...a, is_default: false } : a)), newAddr];
    setAddresses(updated);
    localStorage.setItem(`amitie_addresses_${user.id}`, JSON.stringify(updated));

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

  const sendNotification = async (userId: string, title: string, message: string, icon?: string) => {
    const newNotif: Notification = {
      id: 'notif-' + Date.now(),
      user_id: userId,
      title,
      message,
      icon: icon || 'bi-bell-fill',
      is_read: false,
      created_at: new Date().toISOString()
    };

    if (user && user.id === userId) {
      setNotifications((prev) => [newNotif, ...prev]);
      localStorage.setItem(`notifs_${userId}`, JSON.stringify([newNotif, ...notifications]));
    }

    try {
      await supabase.from('notifications').insert([{
        user_id: userId,
        title: newNotif.title,
        message: newNotif.message,
        icon: newNotif.icon,
        is_read: false
      }]);
    } catch (e) {
      console.warn('Notification saved locally', e);
    }
  };

  const markNotificationsAsRead = async () => {
    if (!user) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    localStorage.setItem(`notifs_${user.id}`, JSON.stringify(notifications.map((n) => ({ ...n, is_read: true }))));

    try {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    } catch (e) {
      console.warn('Notifications marked read locally', e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        allUsers,
        addresses,
        notifications,
        unreadCount,
        login,
        register,
        registerStaff,
        logout,
        addAddress,
        deleteAddress,
        markNotificationsAsRead,
        sendNotification,
        refreshUserData,
        refreshAllUsers
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
