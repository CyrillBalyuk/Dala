import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface CertificateData {
  name: string;
  courseTitle: string;
  date: string;
}

export type Language = 'ru' | 'en' | 'kz';

export class CertificateGenerator {
  private static async loadTemplate(language: Language): Promise<string> {
    const response = await fetch(`/assets/cert_template_${language}.html`);
    if (!response.ok) {
      throw new Error(`Failed to load template for language: ${language}`);
    }
    return response.text();
  }

  private static substituteTemplate(template: string, data: CertificateData): string {
    return template
      .replace(/\{\{NAME\}\}/g, data.name)
      .replace(/\{\{COURSE_TITLE\}\}/g, data.courseTitle)
      .replace(/\{\{DATE\}\}/g, data.date);
  }

  private static createTempElement(htmlContent: string): HTMLElement {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '800px';
    document.body.appendChild(tempDiv);
    return tempDiv;
  }

  private static async htmlToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
    return html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: 800,
      height: 600
    });
  }

  private static canvasToPDF(canvas: HTMLCanvasElement): jsPDF {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const imgWidth = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    return pdf;
  }

  private static formatDate(): string {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${day}.${month}.${year}`;
  }

  public static async generateCertificate(
    courseId: string,
    courseTitle: string,
    userName: string,
    userId: string,
    language: Language
  ): Promise<void> {
    try {
      const template = await this.loadTemplate(language);
      const certificateData: CertificateData = {
        name: userName,
        courseTitle: courseTitle,
        date: this.formatDate()
      };

      const htmlContent = this.substituteTemplate(template, certificateData);
      const tempElement = this.createTempElement(htmlContent);

      try {
        const canvas = await this.htmlToCanvas(tempElement);
        const pdf = this.canvasToPDF(canvas);

        const fileName = `${courseId}_certificate_${language}_${userId}.pdf`;
        pdf.save(fileName);
      } finally {
        document.body.removeChild(tempElement);
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw new Error('Failed to generate certificate');
    }
  }
}