import React, { useState, useEffect, useMemo } from 'react';
import { Download, Award, Calendar, Clock } from 'lucide-react';
import { Certificate, Ticket, ParticipantStatus } from '../types';
import { ApiService } from '../services/api';
import { CertificateService } from '../services/certificate';
import { useParticipants } from '../hooks/useParticipants';
import { CertificateFilters } from './CertificateFilters';

export const Certificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const { participants } = useParticipants();
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      const certsData = await ApiService.getCertificates();
      setCertificates(certsData);
    } catch (error) {
      console.error('Erro ao carregar certificados:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (ticket: Ticket, horasParticipacao: number) => {
    try {
      await CertificateService.generatePDF(ticket, horasParticipacao);
    } catch (error) {
      console.error('Erro ao gerar certificado:', error);
    }
  };

  const generateCertificate = async (participantStatus: ParticipantStatus) => {
    try {
      await ApiService.generateCertificate(participantStatus.ticket.id, participantStatus.totalHours);
      // Atualizar apenas os dados necessários ao invés de recarregar tudo
      const certsData = await ApiService.getCertificates();
      setCertificates(certsData);
      // Recarregar participantes para atualizar o status
      window.location.reload(); // Solução temporária - ideal seria usar um contexto global
    } catch (error) {
      console.error('Erro ao gerar certificado:', error);
    }
  };

  // Obter tipos únicos para o filtro
  const uniqueTypes = useMemo(() => {
    const types = participants.map(p => p.ticketType);
    return Array.from(new Set(types.map(t => t.id))).map(id => {
      const type = types.find(t => t.id === id);
      return { id: type!.id, nome: type!.nome };
    });
  }, [participants]);

  // Filtrar certificados
  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      const participant = participants.find(p => p.ticket.id === cert.ticket_id);
      if (!participant) return false;

      // Filtro de busca
      const matchesSearch = searchTerm === '' || 
        participant.ticket.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.ticket.codigo_unico.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de tipo
      const matchesType = typeFilter === 'all' || 
        participant.ticketType.id === typeFilter;

      // Filtro de data
      const matchesDate = (() => {
        if (dateFilter === 'all') return true;
        
        const certDate = new Date(cert.generated_at);
        const now = new Date();
        
        switch (dateFilter) {
          case 'today': {
            return certDate.toDateString() === now.toDateString();
          }
          case 'week': {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return certDate >= weekAgo;
          }
          case 'month': {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return certDate >= monthAgo;
          }
          case 'year': {
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            return certDate >= yearAgo;
          }
          default:
            return true;
        }
      })();

      return matchesSearch && matchesType && matchesDate;
    });
  }, [certificates, participants, searchTerm, typeFilter, dateFilter]);

  // Limpar todos os filtros
  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setDateFilter('all');
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = searchTerm !== '' || typeFilter !== 'all' || dateFilter !== 'all';

  const certificatesWithDetails = filteredCertificates.map(cert => {
    const participant = participants.find(p => p.ticket.id === cert.ticket_id);
    return { certificate: cert, participant };
  });

  const eligibleParticipants = participants.filter(p => 
    p.isEligibleForCertificate && !p.certificateGenerated
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Certificados</h1>
        <p className="mt-2 text-gray-600">Gerencie e baixe certificados de participação</p>
      </div>

      {/* Eligible Participants */}
      {eligibleParticipants.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-4">
            Participantes Elegíveis para Certificado ({eligibleParticipants.length})
          </h3>
          <div className="space-y-3">
            {eligibleParticipants.map((participant) => (
              <div key={participant.ticket.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{participant.ticket.nome}</div>
                  <div className="text-sm text-gray-500">
                    {participant.totalHours.toFixed(2)}h • {participant.ticketType.nome}
                  </div>
                </div>
                <button
                  onClick={() => generateCertificate(participant)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Award className="h-4 w-4 mr-1" />
                  Gerar Certificado
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Certificates */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Certificados Gerados
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Visualize e baixe certificados de participação
                {hasActiveFilters && (
                  <span className="ml-2 text-blue-600">
                    ({filteredCertificates.length} de {certificates.length} resultados)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-4">
            <CertificateFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              ticketTypes={uniqueTypes}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              filteredCount={filteredCertificates.length}
              totalCount={certificates.length}
            />
          </div>
          
          {filteredCertificates.length === 0 ? (
            <div className="text-center py-12">
              <Award className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {hasActiveFilters ? 'Nenhum certificado encontrado' : 'Nenhum certificado gerado'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {hasActiveFilters 
                  ? 'Tente ajustar os filtros para encontrar certificados.'
                  : 'Certificados serão gerados automaticamente quando participantes atingirem o tempo mínimo.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tempo de Participação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gerado em
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {certificatesWithDetails.map(({ certificate, participant }) => (
                    <tr key={certificate.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {participant ? (
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
                        ) : (
                          <span className="text-sm text-gray-500">Participante não encontrado</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {certificate.tempo_participacao.toFixed(2)} horas
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500">
                            {new Date(certificate.generated_at).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {participant && (
                          <button
                            onClick={() => downloadCertificate(participant.ticket, certificate.tempo_participacao)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Baixar PDF
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    {certificates.length}
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
                    Elegíveis Pendentes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {eligibleParticipants.length}
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
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Downloads Realizados
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {certificates.filter(c => c.downloaded).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};