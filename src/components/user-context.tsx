'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getDeviceId, getUserName, setUserName } from '../utils/device-id';

interface User {
  id: string;
  name: string;
  gamesPlayed: number;
  highScore: number;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  updateName: (name: string) => void;
  updateGameStats: (score: number) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  updateName: () => {},
  updateGameStats: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const deviceId = getDeviceId();
    const name = getUserName();
    
    setUser({
      id: deviceId,
      name: name || 'Player',
      gamesPlayed: 0,
      highScore: 0,
    });
    setLoading(false);
  }, []);

  const updateName = (name: string) => {
    setUserName(name);
    setUser((prev) => (prev ? { ...prev, name } : null));
  };

  const updateGameStats = (score: number) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        highScore: Math.max(prev.highScore, score),
      };
    });
  };

  return (
    <UserContext.Provider value={{ user, loading, updateName, updateGameStats }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
