import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Users, Edit2, Trash2, FileText, Download, Upload } from 'lucide-react';
import { ParticipantFilters } from './ParticipantFilters';
import { TicketType, Ticket as TicketModel } from '../types';
import { ApiService } from '../services/api';
import { ReportGenerator } from '../services/reportGenerator';
import { StorageService } from '../services/storage';

export const Configuration: React.FC = () => {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [tickets, setTickets] = useState<TicketModel[]>([]);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [editingType, setEditingType] = useState<TicketType | null>(null);
  const [editingTicket, setEditingTicket] = useState<TicketModel | null>(null);
  const [typeForm, setTypeForm] = useState({ nome: '', horas_minimas_para_certificado: 0 });
  const [ticketForm, setTicketForm] = useState({ nome: '', email: '', tipo_id: '', codigo_unico: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para filtros de participantes
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [typesData, ticketsData] = await Promise.all([
      ApiService.getTicketTypes(),
      ApiService.getTickets()
    ]);
    setTicketTypes(typesData);
    setTickets(ticketsData);
  };

  // Filtrar participantes
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Filtro de busca
      const matchesSearch = searchTerm === '' || 
        ticket.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.codigo_unico.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de tipo
      const matchesType = typeFilter === 'all' || 
        ticket.tipo_id === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [tickets, searchTerm, typeFilter]);

  // Limpar todos os filtros
  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = searchTerm !== '' || typeFilter !== 'all';

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      if (editingType) {
        await ApiService.updateTicketType(editingType.id, typeForm);
        setMessage({ type: 'success', text: 'Tipo de ticket atualizado com sucesso!' });
      } else {
        await ApiService.createTicketType(typeForm);
        setMessage({ type: 'success', text: 'Tipo de ticket criado com sucesso!' });
      }
      setTypeForm({ nome: '', horas_minimas_para_certificado: 0 });
      setShowTypeForm(false);
      setEditingType(null);
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      if (editingTicket) {
        await ApiService.updateTicket(editingTicket.id, ticketForm);
        setMessage({ type: 'success', text: 'Participante atualizado com sucesso!' });
      } else {
        await ApiService.createTicket(ticketForm);
        setMessage({ type: 'success', text: 'Participante criado com sucesso!' });
      }
      setTicketForm({ nome: '', email: '', tipo_id: '', codigo_unico: '' });
      setShowTicketForm(false);
      setEditingTicket(null);
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleEditType = (type: TicketType) => {
    setEditingType(type);
    setTypeForm({
      nome: type.nome,
      horas_minimas_para_certificado: type.horas_minimas_para_certificado
    });
    setShowTypeForm(true);
    setMessage(null);
  };

  const handleDeleteType = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este tipo de ticket?')) return;
    
    setLoading(true);
    setMessage(null);
    
    try {
      await ApiService.deleteTicketType(id);
      setMessage({ type: 'success', text: 'Tipo de ticket excluído com sucesso!' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTicket = (ticket: TicketModel) => {
    setEditingTicket(ticket);
    setTicketForm({
      nome: ticket.nome,
      email: ticket.email,
      tipo_id: ticket.tipo_id,
      codigo_unico: ticket.codigo_unico
    });
    setShowTicketForm(true);
    setMessage(null);
  };

  const handleDeleteTicket = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este participante? Todos os dados relacionados (check-ins, certificados) serão perdidos.')) return;
    
    setLoading(true);
    setMessage(null);
    
    try {
      await ApiService.deleteTicket(id);
      setMessage({ type: 'success', text: 'Participante excluído com sucesso!' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const reportData = await ApiService.generateParticipantsReport();
      await ReportGenerator.generateParticipantsReportPDF(reportData);
      setMessage({ type: 'success', text: 'Relatório PDF gerado com sucesso!' });
    } catch {
      setMessage({ type: 'error', text: 'Erro ao gerar relatório' });
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    setLoading(true);
    try {
      const reportData = await ApiService.generateParticipantsReport();
      await ReportGenerator.exportParticipantsCSV(reportData.participants);
      setMessage({ type: 'success', text: 'Arquivo CSV exportado com sucesso!' });
    } catch {
      setMessage({ type: 'error', text: 'Erro ao exportar CSV' });
    } finally {
      setLoading(false);
    }
  };

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      if (!Array.isArray(jsonData)) {
        throw new Error('O arquivo deve conter um array de objetos');
      }

      let importedTypes = 0;
      let importedTickets = 0;
      const errors: string[] = [];

      // Processar cada item do JSON
      for (const item of jsonData) {
        try {
          // Validar campos obrigatórios
          if (!item.name || !item.email || !item.sector) {
            errors.push(`Item inválido: campos obrigatórios ausentes (name: ${item.name}, email: ${item.email}, sector: ${item.sector})`);
            continue;
          }

          // Verificar se o tipo já existe, se não, criar
          let ticketType = ticketTypes.find(t => t.nome.toLowerCase() === item.sector.toLowerCase());
          
          if (!ticketType) {
            ticketType = await ApiService.createTicketType({
              nome: item.sector,
              horas_minimas_para_certificado: 0 // valor padrão, pode ser ajustado depois
            });
            importedTypes++;
          }

          // Verificar se o ticket já existe (por email ou código)
          const existingTicket = tickets.find(t => 
            t.email.toLowerCase() === item.email.toLowerCase() || 
            t.codigo_unico === item.codebar
          );
          
          if (!existingTicket) {
            // Criar ticket com código personalizado
            const newTicket: Omit<TicketModel, 'id' | 'created_at'> = {
              nome: item.name,
              email: item.email,
              tipo_id: ticketType.id,
              codigo_unico: item.codebar || StorageService.generateUniqueCode()
            };
            
            await ApiService.createTicketWithCustomCode(newTicket);
            importedTickets++;
          } else {
            errors.push(`Participante já existe: ${item.email} ou código ${item.codebar}`);
          }

        } catch (error) {
          errors.push(`Erro ao processar item: ${item.name} - ${(error as Error).message}`);
        }
      }

      // Recarregar dados
      await loadData();

      // Mostrar resultado
      let resultMessage = `Importação concluída! ${importedTypes} tipos criados, ${importedTickets} participantes importados.`;
      if (errors.length > 0) {
        resultMessage += ` ${errors.length} erros encontrados.`;
        console.warn('Erros na importação:', errors);
      }

      setMessage({ 
        type: errors.length > 0 ? 'error' : 'success', 
        text: resultMessage 
      });

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Erro ao processar arquivo: ${(error as Error).message}` 
      });
    } finally {
      setLoading(false);
      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const cancelEdit = () => {
    setEditingType(null);
    setEditingTicket(null);
    setShowTypeForm(false);
    setShowTicketForm(false);
    setTypeForm({ nome: '', horas_minimas_para_certificado: 0 });
    setTicketForm({ nome: '', email: '', tipo_id: '', codigo_unico: '' });
    setMessage(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-2 text-gray-600">Gerencie tipos de ticket e participantes</p>
      </div>

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

      {/* Reports Section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Relatórios e Importação
          </h3>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={generateReport}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              Gerar Relatório PDF
            </button>
            <button
              onClick={exportCSV}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </button>
            <button
              onClick={triggerFileInput}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <p>Formato esperado do JSON:</p>
            <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
{`[
  {
    "name": "Nome do Participante",
    "email": "email@exemplo.com",
    "sector": "Nome do Tipo de Ticket",
    "codebar": "Código Único do Ticket"
  }
]`}
            </pre>
            <p className="mt-2 text-xs text-gray-500">
              <strong>Mapeamento:</strong> name → nome, email → email, sector → tipo de ticket, codebar → código único
            </p>
          </div>
        </div>
      </div>

      {/* Ticket Types Section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Tipos de Ticket
            </h3>
            <button
              onClick={() => {
                setEditingType(null);
                setTypeForm({ nome: '', horas_minimas_para_certificado: 0 });
                setShowTypeForm(!showTypeForm);
                setMessage(null);
              }}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Novo Tipo
            </button>
          </div>

          {showTypeForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                {editingType ? 'Editar Tipo de Ticket' : 'Novo Tipo de Ticket'}
              </h4>
              <form onSubmit={handleCreateType}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome do Tipo</label>
                  <input
                    type="text"
                    required
                    value={typeForm.nome}
                    onChange={(e) => setTypeForm({ ...typeForm, nome: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Participante, Palestrante, VIP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Horas Mínimas para Certificado</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.5"
                    value={typeForm.horas_minimas_para_certificado}
                    onChange={(e) => setTypeForm({ ...typeForm, horas_minimas_para_certificado: Number(e.target.value) })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingType ? 'Atualizar' : 'Criar'} Tipo
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
              </form>
            </div>
          )}

          <div className="space-y-3">
            {ticketTypes.map((type) => (
              <div key={type.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <h4 className="font-medium text-gray-900">{type.nome}</h4>
                  <p className="text-sm text-gray-500">
                    Mínimo {type.horas_minimas_para_certificado}h para certificado
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditType(type)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteType(type.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {ticketTypes.length === 0 && (
              <p className="text-center text-gray-500 py-4">Nenhum tipo de ticket cadastrado</p>
            )}
          </div>
        </div>
      </div>

      {/* Tickets Section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Participantes
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Gerencie todos os participantes registrados
                {hasActiveFilters && (
                  <span className="ml-2 text-blue-600">
                    ({filteredTickets.length} de {tickets.length} resultados)
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">

              <button
                onClick={() => {
                  setEditingTicket(null);
                  setTicketForm({ nome: '', email: '', tipo_id: '', codigo_unico: '' });
                  setShowTicketForm(!showTicketForm);
                  setMessage(null);
                }}
                disabled={ticketTypes.length === 0}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-1" />
                Novo Participante
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-4">
            <ParticipantFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              ticketTypes={ticketTypes}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              filteredCount={filteredTickets.length}
              totalCount={tickets.length}
              showStatusFilter={false}
              showCertificateFilter={false}
            />
          </div>

          {ticketTypes.length === 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Crie pelo menos um tipo de ticket antes de cadastrar participantes.
              </p>
            </div>
          )}

          {showTicketForm && ticketTypes.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                {editingTicket ? 'Editar Participante' : 'Novo Participante'}
              </h4>
              <form onSubmit={handleCreateTicket}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Código</label>
                    <input
                      type="text"
                      required
                      value={ticketForm.codigo_unico}
                      onChange={(e) => setTicketForm({ ...ticketForm, codigo_unico: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    required
                    value={ticketForm.nome}
                    onChange={(e) => setTicketForm({ ...ticketForm, nome: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={ticketForm.email}
                    onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <select
                    required
                    value={ticketForm.tipo_id}
                    onChange={(e) => setTicketForm({ ...ticketForm, tipo_id: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione um tipo</option>
                    {ticketTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingTicket ? 'Atualizar' : 'Criar'} Participante
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => {
                  const type = ticketTypes.find(t => t.id === ticket.tipo_id);
                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{ticket.nome}</div>
                          <div className="text-sm text-gray-500">{ticket.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900">{ticket.codigo_unico}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{type?.nome || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ticket.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditTicket(ticket)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTicket(ticket.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredTickets.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {hasActiveFilters ? 'Nenhum participante encontrado' : 'Nenhum participante'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {hasActiveFilters 
                    ? 'Tente ajustar os filtros para encontrar participantes.'
                    : 'Cadastre participantes para começar a usar o sistema.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};