import React, { useState } from 'react';
import { Clock, UserCheck, UserX, Calendar } from 'lucide-react';
import { ApiService } from '../services/api';
import { ParticipantStatus } from '../types';

interface ManualCheckInOutProps {
  participant: ParticipantStatus;
  onUpdate: () => void;
}

export const ManualCheckInOut: React.FC<ManualCheckInOutProps> = ({ participant, onUpdate }) => {
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualType, setManualType] = useState<'checkin' | 'checkout'>('checkin');
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleManualCheckInOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDate || !manualTime) return;

    setLoading(true);
    setMessage(null);

    try {
      const customTimestamp = new Date(`${manualDate}T${manualTime}`).toISOString();
      
      if (manualType === 'checkin') {
        await ApiService.performCheckIn(participant.ticket.id, customTimestamp);
        setMessage({ type: 'success', text: 'Check-in manual realizado com sucesso!' });
      } else {
        const result = await ApiService.performCheckOut(participant.ticket.id, customTimestamp);
        if (result.certificateGenerated) {
          setMessage({ 
            type: 'success', 
            text: 'Check-out manual realizado e certificado gerado!' 
          });
        } else {
          setMessage({ type: 'success', text: 'Check-out manual realizado com sucesso!' });
        }
      }
      
      setShowManualForm(false);
      setManualDate('');
      setManualTime('');
      // Aguardar um pouco para garantir que os dados foram salvos
      setTimeout(() => {
        onUpdate();
      }, 100);
    } catch (error) {
      setMessage({ type: 'error', text: `Erro ao realizar ${manualType} manual` });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    return { date, time };
  };

  const openManualForm = (type: 'checkin' | 'checkout') => {
    const { date, time } = getCurrentDateTime();
    setManualType(type);
    setManualDate(date);
    setManualTime(time);
    setShowManualForm(true);
    setMessage(null);
  };

  return (
    <div className="space-y-4">
      {/* Manual Check-in/out Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => openManualForm('checkin')}
          className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Clock className="h-4 w-4 mr-2" />
          Check-in Manual
        </button>
        <button
          onClick={() => openManualForm('checkout')}
          className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Clock className="h-4 w-4 mr-2" />
          Check-out Manual
        </button>
      </div>

      {/* Manual Form */}
      {showManualForm && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            {manualType === 'checkin' ? (
              <UserCheck className="h-4 w-4 mr-2 text-green-600" />
            ) : (
              <UserX className="h-4 w-4 mr-2 text-red-600" />
            )}
            {manualType === 'checkin' ? 'Check-in' : 'Check-out'} Manual
          </h4>
          
          <form onSubmit={handleManualCheckInOut} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Data
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="block w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Horário
                </label>
                <div className="relative">
                  <input
                    type="time"
                    required
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="block w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Clock className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                  manualType === 'checkin'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                }`}
              >
                {manualType === 'checkin' ? (
                  <UserCheck className="h-4 w-4 mr-2" />
                ) : (
                  <UserX className="h-4 w-4 mr-2" />
                )}
                Confirmar {manualType === 'checkin' ? 'Check-in' : 'Check-out'}
              </button>
              <button
                type="button"
                onClick={() => setShowManualForm(false)}
                className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-md text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
};