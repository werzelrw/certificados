import React, { useState, useMemo } from 'react';
import { Users, Clock, Award, CheckCircle } from 'lucide-react';
import { useParticipants } from '../hooks/useParticipants';
import { ParticipantFilters } from './ParticipantFilters';

export const Dashboard: React.FC = () => {
  const { participants, loading, error } = useParticipants();
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [certificateFilter, setCertificateFilter] = useState<'all' | 'eligible' | 'not-eligible'>('all');



  // Filtrar participantes
  const filteredParticipants = useMemo(() => {
    return participants.filter(participant => {
      // Filtro de busca
      const matchesSearch = searchTerm === '' || 
        participant.ticket.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.ticket.codigo_unico.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de status
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'present' && participant.isCheckedIn) ||
        (statusFilter === 'absent' && !participant.isCheckedIn);

      // Filtro de tipo
      const matchesType = typeFilter === 'all' || 
        participant.ticketType.nome === typeFilter;

      // Filtro de certificado
      const matchesCertificate = certificateFilter === 'all' ||
        (certificateFilter === 'eligible' && participant.isEligibleForCertificate) ||
        (certificateFilter === 'not-eligible' && !participant.isEligibleForCertificate);

      return matchesSearch && matchesStatus && matchesType && matchesCertificate;
    });
  }, [participants, searchTerm, statusFilter, typeFilter, certificateFilter]);

  // Limpar todos os filtros
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setCertificateFilter('all');
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || typeFilter !== 'all' || certificateFilter !== 'all';

  const stats = {
    totalParticipants: participants.length,
    checkedIn: participants.filter(p => p.isCheckedIn).length,
    eligible: participants.filter(p => p.isEligibleForCertificate).length,
    certificatesGenerated: participants.filter(p => p.certificateGenerated).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Erro ao carregar dados</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard do Evento</h1>
        <p className="mt-2 text-gray-600">Visão geral dos participantes e presença</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Participantes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalParticipants}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Presentes Agora
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.checkedIn}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Elegíveis para Certificado
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.eligible}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Certificados Gerados
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.certificatesGenerated}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Participantes
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Status atual de todos os participantes registrados
                {hasActiveFilters && (
                  <span className="ml-2 text-blue-600">
                    ({filteredParticipants.length} de {participants.length} resultados)
                  </span>
                )}
              </p>
            </div>

          </div>

          {/* Filtros */}
          <div className="mt-4">
            <ParticipantFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              certificateFilter={certificateFilter}
              onCertificateFilterChange={setCertificateFilter}
              ticketTypes={participants.map(p => ({ id: p.ticketType.nome, nome: p.ticketType.nome }))}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              filteredCount={filteredParticipants.length}
              totalCount={participants.length}
              showStatusFilter={true}
              showCertificateFilter={true}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParticipants.map((participant) => (
                <tr key={participant.ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {participant.ticket.nome}
                      </div>
                      <div className="text-sm text-gray-500">
                        {participant.ticket.email}
                      </div>
                      <div className="text-xs text-gray-400">
                        {participant.ticket.codigo_unico}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{participant.ticketType.nome}</div>
                    <div className="text-xs text-gray-500">
                      Mín: {participant.ticketType.horas_minimas_para_certificado}h
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      participant.isCheckedIn
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {participant.isCheckedIn ? 'Presente' : 'Ausente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {participant.totalHours.toFixed(2)}h
                    </div>
                    <div className={`text-xs ${
                      participant.isEligibleForCertificate ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {participant.isEligibleForCertificate ? 'Elegível' : 'Não elegível'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {participant.certificateGenerated ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        Gerado
                      </span>
                    ) : participant.isEligibleForCertificate ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pendente
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        N/A
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredParticipants.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {hasActiveFilters ? 'Nenhum participante encontrado' : 'Nenhum participante'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {hasActiveFilters 
                  ? 'Tente ajustar os filtros para encontrar participantes.'
                  : 'Configure os tipos de ticket e cadastre participantes para começar.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};