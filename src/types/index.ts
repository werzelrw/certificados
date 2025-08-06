export interface TicketType {
  id: string;
  nome: string;
  horas_minimas_para_certificado: number;
  created_at: string;
}

export interface Ticket {
  id: string;
  nome: string;
  email: string;
  codigo_unico: string;
  tipo_id: string;
  created_at: string;
}

export interface CheckInOut {
  id: string;
  ticket_id: string;
  timestamp: string;
  tipo: 'checkin' | 'checkout';
}

export interface Certificate {
  id: string;
  ticket_id: string;
  tempo_participacao: number; // em horas
  generated_at: string;
  downloaded: boolean;
}

export interface ParticipantStatus {
  ticket: Ticket;
  ticketType: TicketType;
  isCheckedIn: boolean;
  totalHours: number;
  isEligibleForCertificate: boolean;
  certificateGenerated: boolean;
  lastCheckIn?: string;
  checkHistory: CheckInOut[];
}