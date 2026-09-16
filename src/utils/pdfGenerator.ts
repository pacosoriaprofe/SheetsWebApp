import { jsPDF } from 'jspdf';
import { Chapter } from '../types';

/**
 * Generates a clean, professionally formatted PDF in Spanish for a given chapter.
 */
export function generateChapterPDF(chapter: Chapter): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
  const marginX = 20;
  const contentWidth = pageWidth - marginX * 2; // 170 mm
  const topMargin = 25;
  const bottomMargin = 25;

  let currentY = topMargin;

  // Helper to check for page break
  const ensureSpace = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      currentY = topMargin;
      return true;
    }
    return false;
  };

  // Helper to draw text with automatic wrapping
  const renderParagraph = (
    text: string,
    fontSize: number = 10,
    isBold: boolean = false,
    color: [number, number, number] = [51, 65, 85],
    lineHeightFactor: number = 5
  ) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(text, contentWidth);
    const blockHeight = lines.length * lineHeightFactor;

    ensureSpace(blockHeight + 2);
    doc.text(lines, marginX, currentY);
    currentY += blockHeight + 2;
  };

  // --- COVER / HEADER BANNER ---
  // Top green accent bar
  doc.setFillColor(15, 157, 88); // Emerald #0F9D58
  doc.rect(marginX, currentY, contentWidth, 3, 'F');
  currentY += 8;

  // Badge Category
  doc.setFillColor(209, 250, 229); // emerald-100
  doc.roundedRect(marginX, currentY, 32, 6, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(6, 95, 70); // emerald-800
  doc.text(chapter.category.toUpperCase(), marginX + 3, currentY + 4.2);

  // Read Time
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Tiempo de lectura estimado: ${chapter.readTime}`, marginX + 38, currentY + 4.2);
  currentY += 10;

  // Chapter Number
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 157, 88);
  doc.text(chapter.numberText.toUpperCase(), marginX, currentY);
  currentY += 6;

  // Chapter Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  const titleLines = doc.splitTextToSize(chapter.title, contentWidth);
  doc.text(titleLines, marginX, currentY);
  currentY += titleLines.length * 7 + 2;

  // Chapter Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105); // slate-600
  const subtitleLines = doc.splitTextToSize(chapter.subtitle, contentWidth);
  doc.text(subtitleLines, marginX, currentY);
  currentY += subtitleLines.length * 5.5 + 4;

  // Summary box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  const summaryLines = doc.splitTextToSize(chapter.summary, contentWidth - 8);
  const summaryBoxHeight = summaryLines.length * 4.8 + 12;

  ensureSpace(summaryBoxHeight + 4);
  doc.roundedRect(marginX, currentY, contentWidth, summaryBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 157, 88);
  doc.text('RESUMEN DEL CAPÍTULO', marginX + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(summaryLines, marginX + 4, currentY + 11);
  currentY += summaryBoxHeight + 6;

  // Diagram concept box if available
  if (chapter.diagram) {
    const diagLines = doc.splitTextToSize(chapter.diagram.caption, contentWidth - 8);
    const diagHeight = diagLines.length * 4.8 + 12;

    ensureSpace(diagHeight + 4);
    doc.setFillColor(240, 253, 244); // emerald-50
    doc.setDrawColor(187, 247, 208); // emerald-200
    doc.roundedRect(marginX, currentY, contentWidth, diagHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(21, 128, 61); // emerald-700
    doc.text(`CONCEPTO VISUAL: ${chapter.diagram.title}`, marginX + 4, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(diagLines, marginX + 4, currentY + 11);
    currentY += diagHeight + 8;
  }

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, currentY, marginX + contentWidth, currentY);
  currentY += 8;

  // --- SECTIONS ---
  chapter.sections.forEach((section) => {
    ensureSpace(18);

    // Section title
    doc.setFillColor(15, 157, 88);
    doc.rect(marginX, currentY - 1, 2, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    const sTitleLines = doc.splitTextToSize(section.title, contentWidth - 6);
    doc.text(sTitleLines, marginX + 5, currentY + 4);
    currentY += sTitleLines.length * 6 + 4;

    // Section paragraphs
    section.content.forEach((para) => {
      renderParagraph(para, 9.5, false, [51, 65, 85], 4.8);
    });

    // Subsections
    if (section.subsections && section.subsections.length > 0) {
      section.subsections.forEach((sub) => {
        ensureSpace(14);
        currentY += 2;

        // Subtitle
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(30, 41, 59);
        const subTitleLines = doc.splitTextToSize(sub.title, contentWidth - 4);
        doc.text(subTitleLines, marginX + 3, currentY);
        currentY += subTitleLines.length * 5 + 2;

        // Sub paragraphs
        sub.content.forEach((subPara) => {
          renderParagraph(subPara, 9, false, [71, 85, 105], 4.6);
        });

        // Tip box if present
        if (sub.tip) {
          const tipLines = doc.splitTextToSize(`Consejo práctico: ${sub.tip}`, contentWidth - 8);
          const tipBoxHeight = tipLines.length * 4.5 + 8;
          ensureSpace(tipBoxHeight + 4);

          doc.setFillColor(254, 243, 199); // amber-100
          doc.setDrawColor(251, 191, 36); // amber-400
          doc.roundedRect(marginX + 2, currentY, contentWidth - 4, tipBoxHeight, 1.5, 1.5, 'FD');

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(120, 53, 15); // amber-900
          doc.text(tipLines, marginX + 6, currentY + 5.5);
          currentY += tipBoxHeight + 4;
        }
      });
    }

    // Key takeaways
    if (section.keyTakeaways && section.keyTakeaways.length > 0) {
      ensureSpace(20);
      currentY += 2;

      const takeawayHeader = 'Puntos Clave para Recordar:';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 157, 88);
      doc.text(takeawayHeader, marginX + 2, currentY);
      currentY += 5;

      section.keyTakeaways.forEach((takeaway) => {
        const bulletLines = doc.splitTextToSize(`•  ${takeaway}`, contentWidth - 6);
        const bulletHeight = bulletLines.length * 4.5;
        ensureSpace(bulletHeight + 2);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(bulletLines, marginX + 4, currentY);
        currentY += bulletHeight + 2;
      });

      currentY += 4;
    }

    currentY += 4;
  });

  // --- RUNNING HEADERS & FOOTERS (Page numbers) ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Running Header (pages > 1)
    if (i > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('Google Sheets Guía Interactiva en Español', marginX, 15);
      doc.text(chapter.numberText, pageWidth - marginX - doc.getTextWidth(chapter.numberText), 15);

      doc.setDrawColor(241, 245, 249);
      doc.line(marginX, 18, pageWidth - marginX, 18);
    }

    // Running Footer
    doc.setDrawColor(241, 245, 249);
    doc.line(marginX, pageHeight - 15, pageWidth - marginX, pageHeight - 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Manual Completo de Aprendizaje • Lectura Offline', marginX, pageHeight - 10);

    const pageStr = `Página ${i} de ${totalPages}`;
    doc.text(pageStr, pageWidth - marginX - doc.getTextWidth(pageStr), pageHeight - 10);
  }

  return doc;
}
