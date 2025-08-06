import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp
} from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase';
import { TicketType, Ticket, CheckInOut, Certificate } from '../types';

export class FirebaseService {
  // Geração de IDs únicos
  static generateId(): string {
    return doc(collection(db, 'temp')).id;
  }

  static generateUniqueCode(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Ticket Types
  static async getTicketTypes(): Promise<TicketType[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.TICKET_TYPES));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || doc.data().created_at
      })) as TicketType[];
    } catch (error) {
      console.error('Erro ao buscar tipos de ticket:', error);
      return [];
    }
  }

  static async saveTicketTypes(types: TicketType[]): Promise<void> {
    // Para Firebase, vamos salvar individualmente
    for (const type of types) {
      if (type.id) {
        await updateDoc(doc(db, COLLECTIONS.TICKET_TYPES, type.id), {
          nome: type.nome,
          horas_minimas_para_certificado: type.horas_minimas_para_certificado
        });
      }
    }
  }

  static async createTicketType(data: Omit<TicketType, 'id' | 'created_at'>): Promise<TicketType> {
    const docRef = await addDoc(collection(db, COLLECTIONS.TICKET_TYPES), {
      ...data,
      created_at: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      ...data,
      created_at: new Date().toISOString()
    };
  }

  static async updateTicketType(id: string, data: Partial<Omit<TicketType, 'id' | 'created_at'>>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.TICKET_TYPES, id), data);
  }

  static async deleteTicketType(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.TICKET_TYPES, id));
  }

  // Tickets
  static async getTickets(): Promise<Ticket[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.TICKETS));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || doc.data().created_at
      })) as Ticket[];
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
      return [];
    }
  }

  static async saveTickets(tickets: Ticket[]): Promise<void> {
    // Para Firebase, vamos salvar individualmente
    for (const ticket of tickets) {
      if (ticket.id) {
        await updateDoc(doc(db, COLLECTIONS.TICKETS, ticket.id), {
          nome: ticket.nome,
          email: ticket.email,
          tipo_id: ticket.tipo_id,
          codigo_unico: ticket.codigo_unico
        });
      }
    }
  }

  static async createTicket(data: Omit<Ticket, 'id'  | 'created_at'>): Promise<Ticket> {
    const codigo_unico = data.codigo_unico || this.generateUniqueCode();
    const docRef = await addDoc(collection(db, COLLECTIONS.TICKETS), {
      ...data,
      codigo_unico,
      created_at: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      codigo_unico,
      ...data,
      created_at: new Date().toISOString()
    };
  }

  static async createTicketWithCustomCode(data: Omit<Ticket, 'id' | 'created_at'>): Promise<Ticket> {
    const docRef = await addDoc(collection(db, COLLECTIONS.TICKETS), {
      ...data,
      created_at: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      ...data,
      created_at: new Date().toISOString()
    };
  }

  static async updateTicket(id: string, data: Partial<Omit<Ticket, 'id' | 'codigo_unico' | 'created_at'>>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.TICKETS, id), data);
  }

  static async deleteTicket(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.TICKETS, id));
  }

  static async getTicketByCode(codigo: string): Promise<Ticket | null> {
    try {
      const q = query(
        collection(db, COLLECTIONS.TICKETS), 
        where('codigo_unico', '==', codigo.toLowerCase())
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || doc.data().created_at
      } as Ticket;
    } catch (error) {
      console.error('Erro ao buscar ticket por código:', error);
      return null;
    }
  }

  // Check-in/Check-out
  static async getCheckInOuts(): Promise<CheckInOut[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.CHECK_IN_OUTS));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp
      })) as CheckInOut[];
    } catch (error) {
      console.error('Erro ao buscar check-ins/outs:', error);
      return [];
    }
  }

  static async saveCheckInOuts(checkInOuts: CheckInOut[]): Promise<void> {
    // Para Firebase, vamos salvar individualmente
    for (const checkInOut of checkInOuts) {
      if (checkInOut.id) {
        await updateDoc(doc(db, COLLECTIONS.CHECK_IN_OUTS, checkInOut.id), {
          ticket_id: checkInOut.ticket_id,
          timestamp: checkInOut.timestamp,
          tipo: checkInOut.tipo
        });
      }
    }
  }

  static async createCheckInOut(data: Omit<CheckInOut, 'id'>): Promise<CheckInOut> {
    const docRef = await addDoc(collection(db, COLLECTIONS.CHECK_IN_OUTS), {
      ...data,
      timestamp: new Date(data.timestamp)
    });
    
    return {
      id: docRef.id,
      ...data
    };
  }

  // Certificates
  static async getCertificates(): Promise<Certificate[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.CERTIFICATES));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        generated_at: doc.data().generated_at?.toDate?.()?.toISOString() || doc.data().generated_at
      })) as Certificate[];
    } catch (error) {
      console.error('Erro ao buscar certificados:', error);
      return [];
    }
  }

  static async saveCertificates(certificates: Certificate[]): Promise<void> {
    // Para Firebase, vamos salvar individualmente
    for (const certificate of certificates) {
      if (certificate.id) {
        await updateDoc(doc(db, COLLECTIONS.CERTIFICATES, certificate.id), {
          ticket_id: certificate.ticket_id,
          tempo_participacao: certificate.tempo_participacao,
          generated_at: certificate.generated_at,
          downloaded: certificate.downloaded
        });
      }
    }
  }

  static async createCertificate(data: Omit<Certificate, 'id'>): Promise<Certificate> {
    const docRef = await addDoc(collection(db, COLLECTIONS.CERTIFICATES), {
      ...data,
      generated_at: new Date(data.generated_at)
    });
    
    return {
      id: docRef.id,
      ...data
    };
  }
} 