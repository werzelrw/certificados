import jsPDF from 'jspdf';
import { Ticket } from '../types';

export class CertificateService {

  // Método auxiliar para carregar imagem como base64
  private static loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  static async generatePDF(ticket: Ticket, horasParticipacao: number): Promise<void> {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    try {
      const imageUrl = '/fundo_certificado.jpg'; // deve estar em public/
      const imgData = await this.loadImageAsBase64(imageUrl);

      // Adiciona imagem de fundo (A4 landscape: 297x210 mm)
      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);

      // Adiciona o nome no local desejado (ajuste a coordenada Y conforme necessário)
      pdf.setTextColor(13, 79, 76);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(26);
      pdf.text(ticket.nome.toUpperCase(), 148.5, 87, { align: 'center' }); // centralizado

      // Salvar o PDF
      
      if(ticket.email) {
        const base64DataUri = pdf.output('datauristring');
        const base64 = base64DataUri.replace("data:application/pdf;filename=generated.pdf;base64,", '');
        
        const emailPayload = {
          to: ticket.email.trim(),
          subject: "Seu Certificado de Participação",
          message: `
            Olá ${ticket.nome},<br><br>
            Segue em anexo seu certificado de participação no I Congresso Jurídico do Terceiro Planalto.
            Atenciosamente,
            Equipe Show Ingresso
          `,
          from_name: "Show Ingresso",
          from_email: "contato@nudev.com.br",
          attachments: [
            {
              filename: `certificado-${ticket.codigo_unico}.pdf`,
              content: base64,
              mime_type: 'application/pdf'
            }
          ]
        };
        // Envia via POST
        const response = await fetch('https://pskreutz.com.br/desenv/sendmail/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailPayload)
        });
        const result = await response.json();
      }
      pdf.save(`certificado-${ticket.codigo_unico}.pdf`);
      
    } catch (error) {
      console.error('Erro ao gerar certificado:', error);
      alert('Falha ao gerar o certificado. Verifique se a imagem está acessível.');
    }
  }
}
