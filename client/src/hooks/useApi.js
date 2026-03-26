import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data } = await api.get('/subscriptions');
      return data;
    },
  });
}

export function useScores() {
  return useQuery({
    queryKey: ['scores'],
    queryFn: async () => {
      const { data } = await api.get('/scores');
      return data;
    },
    // Don't refetch on window focus as often to avoid spamming while entering
    refetchOnWindowFocus: false,
  });
}

export function useWinnings() {
  return useQuery({
    queryKey: ['winnings'],
    queryFn: async () => {
      const { data } = await api.get('/winnings/me');
      return data;
    },
  });
}
