import React, { useState } from 'react';
import { QrCode, Search, UserCheck, UserX, Clock, Camera } from 'lucide-react';
import { ApiService } from '../services/api';
import { ParticipantStatus } from '../types';
import { QRScanner } from './QRScanner';
import { ManualCheckInOut } from './ManualCheckInOut';

export const CheckInOut: React.FC = () => {
  const [searchCode, setSearchCode] = useState('');
  const [participant, setParticipant] = useState<ParticipantStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const searchParticipant = async () => {
    if (!searchCode.trim()) {
      setMessage({ type: 'error', text: 'Digite um código de ticket' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const ticket = await ApiService.getTicketByCode(searchCode.trim());
      if (!ticket) {
        setMessage({ type: 'error', text: 'Ticket não encontrado' });
        setParticipant(null);
        return;
      }

      const status = await ApiService.getParticipantStatus(ticket.id);
      setParticipant(status);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao buscar participante' });
      setParticipant(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQRResult = (result: string) => {
    setSearchCode(result);
    setShowQRScanner(false);
    // Buscar automaticamente após scan
    setTimeout(() => {
      searchParticipant();
    }, 100);
  };

  const refreshParticipant = async () => {
    if (participant) {
      const updatedStatus = await ApiService.getParticipantStatus(participant.ticket.id);
      setParticipant(updatedStatus);
      // Limpar mensagens antigas após atualização
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  };

  const performCheckIn = async () => {
    if (!participant) return;

    setLoading(true);
    try {
      await ApiService.performCheckIn(participant.ticket.id);
      setMessage({ type: 'success', text: 'Check-in realizado com sucesso!' });
      
      // Aguardar um pouco e recarregar status do participante
      setTimeout(async () => {
        await refreshParticipant();
      }, 100);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao realizar check-in' });
    } finally {
      setLoading(false);
    }
  };

  const performCheckOut = async () => {
    if (!participant) return;

    setLoading(true);
    try {
      const result = await ApiService.performCheckOut(participant.ticket.id);
      
      if (result.certificateGenerated) {
        setMessage({ 
          type: 'success', 
          text: 'Check-out realizado e certificado gerado! PDF baixado automaticamente.' 
        });
      } else {
        setMessage({ type: 'success', text: 'Check-out realizado com sucesso!' });
      }
      
      // Aguardar um pouco e recarregar status do participante
      setTimeout(async () => {
        await refreshParticipant();
      }, 100);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao realizar check-out' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchParticipant();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Check-in / Check-out</h1>
        <p className="mt-2 text-gray-600">Registre a entrada e saída dos participantes</p>
      </div>

      {/* Search Section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Buscar Participante
          </h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite o código do ticket (ex: EVT-123ABC-45DE)"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <QrCode className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            <button
              onClick={searchParticipant}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 mr-2"
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </button>
            <button
              onClick={() => setShowQRScanner(true)}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Camera className="h-4 w-4 mr-2" />
              Escanear QR
            </button>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onResult={handleQRResult}
      />

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm ${
            message.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Participant Info */}
      {participant && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {participant.ticket.nome}
                </h3>
                <p className="text-sm text-gray-500">{participant.ticket.email}</p>
                <p className="text-xs text-gray-400">{participant.ticket.codigo_unico}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  participant.isCheckedIn
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {participant.isCheckedIn ? 'Presente' : 'Ausente'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tempo Total</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {participant.totalHours.toFixed(2)}h
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo de Ticket</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {participant.ticketType.nome}
                  </p>
                  <p className="text-xs text-gray-500">
                    Mínimo: {participant.ticketType.horas_minimas_para_certificado}h
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status do Certificado</p>
                  <p className={`text-sm font-semibold ${
                    participant.certificateGenerated
                      ? 'text-purple-600'
                      : participant.isEligibleForCertificate
                      ? 'text-yellow-600'
                      : 'text-gray-600'
                  }`}>
                    {participant.certificateGenerated
                      ? 'Gerado'
                      : participant.isEligibleForCertificate
                      ? 'Elegível'
                      : 'Não elegível'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={performCheckIn}
                disabled={loading || participant.isCheckedIn}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Check-in
              </button>

              <button
                onClick={performCheckOut}
                disabled={loading || !participant.isCheckedIn}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserX className="h-4 w-4 mr-2" />
                Check-out
              </button>
            </div>

            {/* Manual Check-in/out */}
            <ManualCheckInOut 
              participant={participant} 
              onUpdate={refreshParticipant}
            />

            {/* Check History */}
            {participant.checkHistory.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Histórico de Presença</h4>
                <div className="space-y-2">
                  {participant.checkHistory.slice(-5).reverse().map((entry, index) => (
                    <div key={entry.id} className="flex items-center justify-between text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        entry.tipo === 'checkin'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {entry.tipo === 'checkin' ? 'Check-in' : 'Check-out'}
                      </span>
                      <span className="text-gray-500">
                        {new Date(entry.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};