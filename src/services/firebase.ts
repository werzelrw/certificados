import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { TicketType, Ticket, CheckInOut, Certificate } from '../types';

// Configuração do Firebase - você precisará substituir com suas credenciais
const firebaseConfig = {
  apiKey: "AIzaSyAuQbe_hVgy_Hx1vLHPB25hOuAK9QAOf4Q",
  authDomain: "certificados-fcff7.firebaseapp.com",
  projectId: "certificados-fcff7",
  storageBucket: "certificados-fcff7.firebasestorage.app",
  messagingSenderId: "862236306938",
  appId: "1:862236306938:web:dee8772136e3bf9a858843"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Coleções do Firestore
const COLLECTIONS = {
  TICKET_TYPES: 'ticketTypes',
  TICKETS: 'tickets',
  CHECK_IN_OUTS: 'checkInOuts',
  CERTIFICATES: 'certificates'
} as const;

export { db, COLLECTIONS }; 