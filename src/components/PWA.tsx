import React, { useState, useEffect, useRef } from 'react';
import { Search, CheckCircle, XCircle, User, Clock, Wifi, WifiOff, Camera } from 'lucide-react';
import { ApiService } from '../services/api';
import { ParticipantStatus } from '../types';
import { QRScanner } from './QRScanner';

export const PWA: React.FC = () => {
  const [searchCode, setSearchCode] = useState('');
  const [participant, setParticipant] = useState<ParticipantStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastAction, setLastAction] = useState<string>('');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Registrar service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registrado:', registration);
        })
        .catch(error => {
          console.log('SW falhou:', error);
        });
    }

    // Monitorar conectividade
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const searchParticipant = async () => {
    if (!searchCode.trim()) return;

    setLoading(true);
    setMessage(null);
    setParticipant(null);

    try {
      const ticket = await ApiService.getTicketByCode(searchCode.trim());
      
      if (!ticket) {
        setMessage({ type: 'error', text: 'Participante não encontrado' });
        return;
      }

      const status = await ApiService.getParticipantStatus(ticket.id);
      if (status) {
        setParticipant(status);
        setMessage({ type: 'success', text: 'Participante encontrado!' });
        // Limpar o campo após encontrar o participante
        setSearchCode('');
        // Focar no campo para próximo uso
        searchInputRef.current?.focus();
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao buscar participante' });
    } finally {
      setLoading(false);
    }
  };

  const performCheckIn = async () => {
    if (!participant) return;

    setLoading(true);
    setMessage(null);

    try {
      await ApiService.performCheckIn(participant.ticket.id);
      setLastAction('checkin');
      setMessage({ type: 'success', text: 'Check-in realizado com sucesso!' });
      
      // Atualizar status do participante
      const updatedStatus = await ApiService.getParticipantStatus(participant.ticket.id);
      if (updatedStatus) {
        setParticipant(updatedStatus);
      }
      
      // Limpar campo e resetar após 2 segundos
      setTimeout(() => {
        resetAndFocus();
      }, 2000);
    } catch {
      setMessage({ type: 'error', text: 'Erro ao realizar check-in' });
    } finally {
      setLoading(false);
    }
  };

  const performCheckOut = async () => {
    if (!participant) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await ApiService.performCheckOut(participant.ticket.id);
      setLastAction('checkout');
      
      let messageText = 'Check-out realizado com sucesso!';
      if (result.certificateGenerated) {
        messageText += ' Certificado gerado automaticamente.';
      }
      
      setMessage({ type: 'success', text: messageText });
      
      // Atualizar status do participante
      const updatedStatus = await ApiService.getParticipantStatus(participant.ticket.id);
      if (updatedStatus) {
        setParticipant(updatedStatus);
      }
      
      // Limpar campo e resetar após 2 segundos
      setTimeout(() => {
        resetAndFocus();
      }, 2000);
    } catch {
      setMessage({ type: 'error', text: 'Erro ao realizar check-out' });
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    resetAndFocus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchParticipant();
    }
  };

  const resetAndFocus = () => {
    setSearchCode('');
    setParticipant(null);
    setMessage(null);
    setLastAction('');
    searchInputRef.current?.focus();
  };

  const handleQRResult = (result: string) => {
    setSearchCode(result);
    searchParticipant();
  };

  const openQRScanner = () => {
    setIsQRScannerOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Check-in/Check-out</h1>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm text-gray-600">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        
        {/* Status da última ação */}
        {lastAction && (
          <div className={`p-3 rounded-lg mb-4 ${
            lastAction === 'checkin' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center gap-2">
              {lastAction === 'checkin' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Clock className="h-5 w-5 text-blue-600" />
              )}
              <span className={`text-sm font-medium ${
                lastAction === 'checkin' ? 'text-green-800' : 'text-blue-800'
              }`}>
                {lastAction === 'checkin' ? 'Check-in realizado' : 'Check-out realizado'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Busca */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              ref={searchInputRef}
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Digite o código do participante"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              autoFocus
            />
          </div>
          <button
            onClick={searchParticipant}
            disabled={loading || !searchCode.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={openQRScanner}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Escanear QR Code"
          >
            <Camera className="h-5 w-5" />
          </button>
        </div>
        
        {searchCode && (
          <button
            onClick={clearSearch}
            className="mt-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Limpar busca
          </button>
        )}
      </div>

      {/* Mensagens */}
      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <span className={`text-sm ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message.text}
            </span>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Processando...</p>
        </div>
      )}

      {/* Informações do Participante */}
      {participant && !loading && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {participant.ticket.nome}
              </h2>
              <p className="text-gray-600">{participant.ticket.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Tipo</p>
              <p className="font-semibold text-gray-900">{participant.ticketType.nome}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Código</p>
              <p className="font-mono font-semibold text-gray-900">{participant.ticket.codigo_unico}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Status Atual:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                participant.isCheckedIn 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {participant.isCheckedIn ? 'Presente' : 'Ausente'}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Tempo Total:</span>
              <span className="font-semibold text-gray-900">
                {participant.totalHours.toFixed(1)}h
              </span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3">
            {!participant.isCheckedIn ? (
              <button
                onClick={performCheckIn}
                disabled={loading}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                <CheckCircle className="h-5 w-5 inline mr-2" />
                Check-in
              </button>
            ) : (
              <button
                onClick={performCheckOut}
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Clock className="h-5 w-5 inline mr-2" />
                Check-out
              </button>
            )}
          </div>

          {/* Informações do Certificado */}
          {participant.isEligibleForCertificate && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Elegível para certificado ({participant.ticketType.horas_minimas_para_certificado}h mínimo)
                </span>
              </div>
            </div>
          )}

          {participant.certificateGenerated && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-800">
                  Certificado já gerado
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instruções */}
      {!participant && !loading && (
        <div className="text-center py-12 text-gray-500">
          <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Buscar Participante</h3>
          <p>Digite o código do participante para realizar check-in ou check-out</p>
        </div>
      )}

      {/* QR Scanner */}
      <QRScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onResult={handleQRResult}
      />
    </div>
  );
}; 