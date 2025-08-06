import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ParticipantStatus } from '../types';

export class ReportGenerator {
  static async generateParticipantsReportPDF(data: {
    totalParticipants: number;
    checkedInCount: number;
    eligibleForCertificate: number;
    certificatesGenerated: number;
    participants: ParticipantStatus[];
    reportGeneratedAt: string;
  }): Promise<void> {
    const pdf = new jsPDF();
    
    // Título
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RELATÓRIO DE PARTICIPANTES', 105, 20, { align: 'center' });
    
    // Data de geração
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const reportDate = new Date(data.reportGeneratedAt).toLocaleString('pt-BR');
    pdf.text(`Gerado em: ${reportDate}`, 105, 30, { align: 'center' });
    
    // Linha separadora
    pdf.setLineWidth(0.5);
    pdf.line(20, 35, 190, 35);
    
    // Estatísticas
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RESUMO GERAL', 20, 50);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total de Participantes: ${data.totalParticipants}`, 20, 60);
    pdf.text(`Presentes no Momento: ${data.checkedInCount}`, 20, 70);
    pdf.text(`Elegíveis para Certificado: ${data.eligibleForCertificate}`, 20, 80);
    pdf.text(`Certificados Gerados: ${data.certificatesGenerated}`, 20, 90);
    
    // Linha separadora
    pdf.line(20, 95, 190, 95);
    
    // Lista de participantes
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('LISTA DE PARTICIPANTES', 20, 110);
    
    let yPosition = 125;
    pdf.setFontSize(9);
    
    // Cabeçalho da tabela
    pdf.setFont('helvetica', 'bold');
    pdf.text('Nome', 20, yPosition);
    pdf.text('Email', 70, yPosition);
    pdf.text('Tipo', 120, yPosition);
    pdf.text('Horas', 150, yPosition);
    pdf.text('Status', 170, yPosition);
    
    yPosition += 5;
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 5;
    
    // Dados dos participantes
    pdf.setFont('helvetica', 'normal');
    
    data.participants.forEach((participant, index) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      
      const name = participant.ticket.nome.length > 20 
        ? participant.ticket.nome.substring(0, 17) + '...' 
        : participant.ticket.nome;
      
      const email = participant.ticket.email.length > 25 
        ? participant.ticket.email.substring(0, 22) + '...' 
        : participant.ticket.email;
      
      const type = participant.ticketType.nome.length > 15 
        ? participant.ticketType.nome.substring(0, 12) + '...' 
        : participant.ticketType.nome;
      
      const status = participant.certificateGenerated 
        ? 'Certificado' 
        : participant.isEligibleForCertificate 
        ? 'Elegível' 
        : participant.isCheckedIn 
        ? 'Presente' 
        : 'Ausente';
      
      pdf.text(name, 20, yPosition);
      pdf.text(email, 70, yPosition);
      pdf.text(type, 120, yPosition);
      pdf.text(participant.totalHours.toFixed(1) + 'h', 150, yPosition);
      pdf.text(status, 170, yPosition);
      
      yPosition += 8;
    });
    
    // Rodapé
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
    }
    
    // Salvar
    pdf.save(`relatorio-participantes-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static async exportParticipantsCSV(participants: ParticipantStatus[]): Promise<void> {
    const headers = [
      'Nome',
      'Email',
      'Código do Ticket',
      'Tipo de Ticket',
      'Horas Totais',
      'Status Presença',
      'Elegível para Certificado',
      'Certificado Gerado',
      'Último Check-in'
    ];
    
    const csvContent = [
      headers.join(','),
      ...participants.map(p => [
        `"${p.ticket.nome}"`,
        `"${p.ticket.email}"`,
        p.ticket.codigo_unico,
        `"${p.ticketType.nome}"`,
        p.totalHours.toFixed(2),
        p.isCheckedIn ? 'Presente' : 'Ausente',
        p.isEligibleForCertificate ? 'Sim' : 'Não',
        p.certificateGenerated ? 'Sim' : 'Não',
        p.lastCheckIn ? new Date(p.lastCheckIn).toLocaleString('pt-BR') : 'Nunca'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `participantes-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}