import { useState, useEffect, useCallback } from 'react';
import { ParticipantStatus } from '../types';
import { ApiService } from '../services/api';

export const useParticipants = () => {
  const [participants, setParticipants] = useState<ParticipantStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadParticipants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getAllParticipantsStatus();
      setParticipants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar participantes');
      console.error('Erro ao carregar participantes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshParticipants = useCallback(async () => {
    await loadParticipants();
  }, [loadParticipants]);

  useEffect(() => {
    loadParticipants();
  }, [loadParticipants]);

  return {
    participants,
    loading,
    error,
    refreshParticipants
  };
}; 