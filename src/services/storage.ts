import { TicketType, Ticket, CheckInOut, Certificate } from '../types';

const STORAGE_KEYS = {
  TICKET_TYPES: 'event_ticket_types',
  TICKETS: 'event_tickets',
  CHECK_INOUTS: 'event_check_inouts',
  CERTIFICATES: 'event_certificates'
};

export class StorageService {
  static getTicketTypes(): TicketType[] {
    const data = localStorage.getItem(STORAGE_KEYS.TICKET_TYPES);
    return data ? JSON.parse(data) : [];
  }

  static saveTicketTypes(types: TicketType[]): void {
    localStorage.setItem(STORAGE_KEYS.TICKET_TYPES, JSON.stringify(types));
  }

  static getTickets(): Ticket[] {
    const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return data ? JSON.parse(data) : [];
  }

  static saveTickets(tickets: Ticket[]): void {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  }

  static getCheckInOuts(): CheckInOut[] {
    const data = localStorage.getItem(STORAGE_KEYS.CHECK_INOUTS);
    return data ? JSON.parse(data) : [];
  }

  static saveCheckInOuts(checkInOuts: CheckInOut[]): void {
    localStorage.setItem(STORAGE_KEYS.CHECK_INOUTS, JSON.stringify(checkInOuts));
  }

  static getCertificates(): Certificate[] {
    const data = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    return data ? JSON.parse(data) : [];
  }

  static saveCertificates(certificates: Certificate[]): void {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certificates));
  }

  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static generateUniqueCode(): string {
    return 'EVT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
}