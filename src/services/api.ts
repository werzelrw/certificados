import { TicketType, Ticket, CheckInOut, Certificate, ParticipantStatus } from '../types';
import { FirebaseService } from './firebaseService';
import { CertificateService } from './certificate';
import { differenceInMinutes } from 'date-fns';

// Cache simples para evitar requisições desnecessárias
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milissegundos
}

class Cache {
  private cache = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl: number = 30000): void { // 30 segundos por padrão
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new Cache();

export class ApiService {
  // Ticket Types
  static async createTicketType(data: Omit<TicketType, 'id' | 'created_at'>): Promise<TicketType> {
    const result = await FirebaseService.createTicketType(data);
    cache.invalidate('ticketTypes');
    return result;
  }

  static async updateTicketType(id: string, data: Partial<Omit<TicketType, 'id' | 'created_at'>>): Promise<TicketType> {
    await FirebaseService.updateTicketType(id, data);
    const types = await FirebaseService.getTicketTypes();
    const updatedType = types.find(t => t.id === id);
    if (!updatedType) throw new Error('Tipo de ticket não encontrado');
    return updatedType;
  }

  static async deleteTicketType(id: string): Promise<void> {
    const tickets = await FirebaseService.getTickets();
    
    // Verificar se há tickets usando este tipo
    const hasTickets = tickets.some((ticket: Ticket) => ticket.tipo_id === id);
    if (hasTickets) {
      throw new Error('Não é possível excluir um tipo que possui tickets associados');
    }
    
    await FirebaseService.deleteTicketType(id);
  }
  
  static async getTicketTypes(): Promise<TicketType[]> {
    const cached = cache.get<TicketType[]>('ticketTypes');
    if (cached) return cached;
    
    const data = await FirebaseService.getTicketTypes();
    cache.set('ticketTypes', data, 60000); // 1 minuto
    return data;
  }

  // Tickets
  static async createTicket(data: Omit<Ticket, 'id' | 'created_at'>): Promise<Ticket> {
    const result = await FirebaseService.createTicket(data);
    cache.invalidate('tickets');
    cache.invalidate('participantsStatus');
    return result;
  }

  static async createTicketWithCustomCode(data: Omit<Ticket, 'id' | 'created_at'>): Promise<Ticket> {
    return await FirebaseService.createTicketWithCustomCode(data);
  }

  static async updateTicket(id: string, data: Partial<Omit<Ticket, 'id' | 'created_at'>>): Promise<Ticket> {
    await FirebaseService.updateTicket(id, data);
    const tickets = await FirebaseService.getTickets();
    const updatedTicket = tickets.find((t: Ticket) => t.id === id);
    if (!updatedTicket) throw new Error('Ticket não encontrado');
    return updatedTicket;
  }

  static async deleteTicket(id: string): Promise<void> {
    // Remover ticket
    await FirebaseService.deleteTicket(id);
    
    // Nota: Para Firebase, seria melhor usar regras de segurança ou Cloud Functions
    // para deletar documentos relacionados automaticamente
    console.warn('Check-ins/outs e certificados relacionados devem ser removidos manualmente');
  }
  
  static async getTickets(): Promise<Ticket[]> {
    const cached = cache.get<Ticket[]>('tickets');
    if (cached) return cached;
    
    const data = await FirebaseService.getTickets();
    cache.set('tickets', data, 60000); // 1 minuto
    return data;
  }

  static async getTicketByCode(codigo: string): Promise<Ticket | null> {
    return await FirebaseService.getTicketByCode(codigo);
  }

  // Check-in / Check-out
  static async performCheckIn(ticketId: string, customTimestamp?: string): Promise<CheckInOut> {
    const newCheckIn: Omit<CheckInOut, 'id'> = {
      ticket_id: ticketId,
      timestamp: customTimestamp || new Date().toISOString(),
      tipo: 'checkin'
    };
    const result = await FirebaseService.createCheckInOut(newCheckIn);
    cache.invalidate('participantsStatus');
    return result;
  }

  static async performCheckOut(ticketId: string, customTimestamp?: string): Promise<{ checkOut: CheckInOut, certificateGenerated?: Certificate }> {
    const newCheckOut: Omit<CheckInOut, 'id'> = {
      ticket_id: ticketId,
      timestamp: customTimestamp || new Date().toISOString(),
      tipo: 'checkout'
    };
    const checkOut = await FirebaseService.createCheckInOut(newCheckOut);
    cache.invalidate('participantsStatus');

    // Verificar se é elegível para certificado
    const participantStatus = await this.getParticipantStatus(ticketId);
    let certificateGenerated: Certificate | undefined;

    if (participantStatus && participantStatus.isEligibleForCertificate && !participantStatus.certificateGenerated) {
      certificateGenerated = await this.generateCertificate(ticketId, participantStatus.totalHours);
    }

    return { checkOut, certificateGenerated };
  }

  // Relatórios
  static async generateParticipantsReport(): Promise<{
    totalParticipants: number;
    checkedInCount: number;
    eligibleForCertificate: number;
    certificatesGenerated: number;
    participants: ParticipantStatus[];
    reportGeneratedAt: string;
  }> {
    const participants = await this.getAllParticipantsStatus();
    
    return {
      totalParticipants: participants.length,
      checkedInCount: participants.filter(p => p.isCheckedIn).length,
      eligibleForCertificate: participants.filter(p => p.isEligibleForCertificate).length,
      certificatesGenerated: participants.filter(p => p.certificateGenerated).length,
      participants,
      reportGeneratedAt: new Date().toISOString()
    };
  }
  static async getParticipantStatus(ticketId: string): Promise<ParticipantStatus | null> {
    const tickets = await FirebaseService.getTickets();
    const ticketTypes = await FirebaseService.getTicketTypes();
    const checkInOuts = await FirebaseService.getCheckInOuts();
    const certificates = await FirebaseService.getCertificates();

    const ticket = tickets.find((t: Ticket) => t.id === ticketId);
    if (!ticket) return null;

    const ticketType = ticketTypes.find((tt: TicketType) => tt.id === ticket.tipo_id);
    if (!ticketType) return null;

    const ticketCheckHistory = checkInOuts
      .filter((co: CheckInOut) => co.ticket_id === ticketId)
      .sort((a: CheckInOut, b: CheckInOut) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const totalHours = this.calculateTotalHours(ticketCheckHistory);
    // Encontrar o último evento de cada tipo
    const checkIns = ticketCheckHistory.filter(co => co.tipo === 'checkin');
    const checkOuts = ticketCheckHistory.filter(co => co.tipo === 'checkout');
    
    const lastCheckIn = checkIns.length > 0 ? checkIns[checkIns.length - 1] : null;
    const lastCheckOut = checkOuts.length > 0 ? checkOuts[checkOuts.length - 1] : null;

    // Determinar se está presente baseado no último evento
    const isCheckedIn = lastCheckIn && (!lastCheckOut || 
      new Date(lastCheckIn.timestamp).getTime() > new Date(lastCheckOut.timestamp).getTime());

    const isEligibleForCertificate = totalHours >= ticketType.horas_minimas_para_certificado;
    const certificateGenerated = certificates.some(cert => cert.ticket_id === ticketId);
    return {
      ticket,
      ticketType,
      isCheckedIn: !!isCheckedIn,
      totalHours,
      isEligibleForCertificate,
      certificateGenerated,
      lastCheckIn: lastCheckIn?.timestamp,
      checkHistory: ticketCheckHistory
    };
  }

  static calculateTotalHours(checkHistory: CheckInOut[]): number {
    let totalMinutes = 0;
    let currentCheckIn: CheckInOut | null = null;

    // Ordenar por timestamp para garantir ordem cronológica
    const sortedHistory = [...checkHistory].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (const entry of sortedHistory) {
      if (entry.tipo === 'checkin') {
        currentCheckIn = entry;
      } else if (entry.tipo === 'checkout' && currentCheckIn) {
        const minutes = differenceInMinutes(
          new Date(entry.timestamp),
          new Date(currentCheckIn.timestamp)
        );
        // Só adicionar se for um tempo válido (positivo)
        if (minutes > 0) {
          totalMinutes += minutes;
        }
        currentCheckIn = null;
      }
    }

    return totalMinutes / 60; // Converter para horas
  }

  static async getAllParticipantsStatus(): Promise<ParticipantStatus[]> {
    const cached = cache.get<ParticipantStatus[]>('participantsStatus');
    if (cached) return cached;
    
    // Buscar todos os dados de uma vez ao invés de fazer requisições individuais
    const [tickets, ticketTypes, checkInOuts, certificates] = await Promise.all([
      this.getTickets(),
      this.getTicketTypes(),
      FirebaseService.getCheckInOuts(),
      FirebaseService.getCertificates()
    ]);

    const statuses: ParticipantStatus[] = [];

    for (const ticket of tickets) {
      const ticketType = ticketTypes.find((tt: TicketType) => tt.id === ticket.tipo_id);
      if (!ticketType) continue;

      const ticketCheckHistory = checkInOuts
        .filter((co: CheckInOut) => co.ticket_id === ticket.id)
        .sort((a: CheckInOut, b: CheckInOut) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const totalHours = this.calculateTotalHours(ticketCheckHistory);
      
      // Encontrar o último evento de cada tipo
      const checkIns = ticketCheckHistory.filter(co => co.tipo === 'checkin');
      const checkOuts = ticketCheckHistory.filter(co => co.tipo === 'checkout');
      
      const lastCheckIn = checkIns.length > 0 ? checkIns[checkIns.length - 1] : null;
      const lastCheckOut = checkOuts.length > 0 ? checkOuts[checkOuts.length - 1] : null;

      // Determinar se está presente baseado no último evento
      const isCheckedIn = lastCheckIn && (!lastCheckOut || 
        new Date(lastCheckIn.timestamp).getTime() > new Date(lastCheckOut.timestamp).getTime());

      const isEligibleForCertificate = totalHours >= ticketType.horas_minimas_para_certificado;
      const certificateGenerated = certificates.some(cert => cert.ticket_id === ticket.id);

      statuses.push({
        ticket,
        ticketType,
        isCheckedIn: !!isCheckedIn,
        totalHours,
        isEligibleForCertificate,
        certificateGenerated,
        lastCheckIn: lastCheckIn?.timestamp,
        checkHistory: ticketCheckHistory
      });
    }

    cache.set('participantsStatus', statuses, 30000); // 30 segundos
    return statuses;
  }

  // Certificates
  static async generateCertificate(ticketId: string, horasParticipacao: number): Promise<Certificate> {
    const participantStatus = await this.getParticipantStatus(ticketId);
    
    if (!participantStatus) {
      throw new Error('Participante não encontrado');
    }

    const newCertificate: Omit<Certificate, 'id'> = {
      ticket_id: ticketId,
      tempo_participacao: horasParticipacao,
      generated_at: new Date().toISOString(),
      downloaded: false
    };

    const certificate = await FirebaseService.createCertificate(newCertificate);

    // Gerar PDF
    await CertificateService.generatePDF(participantStatus.ticket, horasParticipacao);

    // Simular envio por email
    console.log(`📧 Certificado enviado por email para: ${participantStatus.ticket.email}`);
    console.log(`🎉 Certificado gerado para ${participantStatus.ticket.nome} - ${horasParticipacao.toFixed(2)} horas`);

    return certificate;
  }

  static async getCertificates(): Promise<Certificate[]> {
    return await FirebaseService.getCertificates();
  }
}