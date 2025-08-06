import React from 'react';
import { Search, X } from 'lucide-react';

interface ParticipantFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  statusFilter?: 'all' | 'present' | 'absent';
  onStatusFilterChange?: (value: 'all' | 'present' | 'absent') => void;
  certificateFilter?: 'all' | 'eligible' | 'not-eligible';
  onCertificateFilterChange?: (value: 'all' | 'eligible' | 'not-eligible') => void;
  ticketTypes: Array<{ id: string; nome: string }>;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  filteredCount: number;
  totalCount: number;
  showStatusFilter?: boolean;
  showCertificateFilter?: boolean;
}

export const ParticipantFilters: React.FC<ParticipantFiltersProps> = ({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter = 'all',
  onStatusFilterChange,
  certificateFilter = 'all',
  onCertificateFilterChange,
  ticketTypes,
  hasActiveFilters,
  onClearFilters,
  filteredCount,
  totalCount,
  showStatusFilter = false,
  showCertificateFilter = false
}) => {
  return (
    <div className="space-y-4">
      {/* Barra de busca */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nome, email ou código..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Filtros */}
      <div className={`grid grid-cols-1 gap-4 ${
        showStatusFilter && showCertificateFilter ? 'sm:grid-cols-4' : 
        (showStatusFilter || showCertificateFilter) ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
      }`}>
        {/* Filtro de Status */}
        {showStatusFilter && onStatusFilterChange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status de Presença
            </label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as 'all' | 'present' | 'absent')}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="present">Presentes</option>
              <option value="absent">Ausentes</option>
            </select>
          </div>
        )}

        {/* Filtro de Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Ticket
          </label>
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos os tipos</option>
            {ticketTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de Certificado */}
        {showCertificateFilter && onCertificateFilterChange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Elegibilidade para Certificado
            </label>
            <select
              value={certificateFilter}
              onChange={(e) => onCertificateFilterChange(e.target.value as 'all' | 'eligible' | 'not-eligible')}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="eligible">Elegíveis</option>
              <option value="not-eligible">Não elegíveis</option>
            </select>
          </div>
        )}

        {/* Contador de resultados */}
        <div className="flex items-end">
          <div className="text-sm text-gray-600">
            {hasActiveFilters ? (
              <span>
                Mostrando {filteredCount} de {totalCount} participantes
              </span>
            ) : (
              <span>
                Total: {totalCount} participantes
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Botão Limpar Filtros */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={onClearFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar Filtros
          </button>
        </div>
      )}
    </div>
  );
}; 