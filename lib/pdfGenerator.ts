/**
 * Client-Side PDF Generator for Electric Studio Admin Portal
 *
 * Generates the S5 Master PDF by combining S3 and S4 content.
 * Uses jsPDF for browser-based PDF generation with ZERO content modification.
 *
 * This approach ensures 100% content fidelity - we act as a typesetter, not a writer.
 */

import jsPDF from 'jspdf';

const cleanMarkdownCodeFences = (text: string): string => {
  if (!text || typeof text !== 'string') return text;

  let cleaned = text.trim();

  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  return cleaned.trim();
};

export interface PDFOptions {
  title?: string;
  fontSize?: number;
  lineSpacing?: number;
  addPageNumbers?: boolean;
  addHeader?: boolean;
  businessName?: string;
}

const DEFAULT_OPTIONS: PDFOptions = {
  title: 'Electric Studio Video Production Guide',
  fontSize: 10,
  lineSpacing: 1.4,
  addPageNumbers: true,
  addHeader: true,
  businessName: 'Client',
};

/**
 * Detect if a line is a header/section title
 */
function detectHeader(line: string): boolean {
  const trimmed = line.trim();
  
  // ALL CAPS with reasonable length
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 5 && trimmed.length < 80) {
    return true;
  }
  
  // Starts with common header patterns
  if (/^(SEGMENT|LAYER|PART|SECTION|CHAPTER|STEP|ASSET|VIDEO|AUDIO)/i.test(trimmed)) {
    return true;
  }
  
  // Markdown-style headers
  if (/^#{1,3}\s/.test(trimmed)) {
    return true;
  }
  
  // Numbered sections
  if (/^\d+\.\s+[A-Z]/.test(trimmed)) {
    return true;
  }
  
  return false;
}

/**
 * Detect if a line is an asset filename
 */
function detectAssetName(line: string): boolean {
  const trimmed = line.trim();
  
  // File extensions
  if (/\.(mp4|mp3|png|jpg|jpeg|txt|pdf|mov|wav|webm|gif)$/i.test(trimmed)) {
    return true;
  }
  
  // Standard asset naming pattern (PREFIX_Type_##)
  if (/^[A-Z]{2,}_[A-Za-z0-9_]+\./i.test(trimmed)) {
    return true;
  }
  
  return false;
}

/**
 * Detect separator lines
 */
function detectSeparator(line: string): boolean {
  const trimmed = line.trim();
  return /^[=\-_]{10,}$/.test(trimmed);
}

/**
 * Generate S5 Master PDF from S3 and S4 content
 * 
 * @param s3Content - The S3 Video Production Package content
 * @param s4Content - The S4 Assembly Instructions content
 * @param options - PDF generation options
 * @param onProgress - Progress callback (0-100)
 * @returns PDF as Blob
 */
export async function generateS5PDF(
  s3Content: string,
  s4Content: string,
  options?: Partial<PDFOptions>,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  if (onProgress) onProgress(5);
  
  // Create PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = opts.fontSize! * opts.lineSpacing!;
  
  let currentY = margin;
  let pageNumber = 1;
  
  // Helper: Add new page
  function addNewPage() {
    // Add page number to current page before creating new one
    if (opts.addPageNumbers) {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 30, { align: 'center' });
    }
    
    doc.addPage();
    pageNumber++;
    currentY = margin;
    
    // Add header to new page
    if (opts.addHeader) {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('⚡ ELECTRIC STUDIO', margin, 30);
      if (opts.title) {
        doc.text(opts.title, pageWidth - margin, 30, { align: 'right' });
      }
      currentY = margin + 20;
    }
  }
  
  // Helper: Add cover page
  function addCoverPage() {
    // Electric purple background header
    doc.setFillColor(139, 92, 246);
    doc.rect(0, 0, pageWidth, 150, 'F');
    
    // Logo text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('⚡ ELECTRIC STUDIO', pageWidth / 2, 60, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('AI-Powered Content & Brand Agency', pageWidth / 2, 85, { align: 'center' });
    
    // Document title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('Video Production Guide', pageWidth / 2, 220, { align: 'center' });
    
    // Client name
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Prepared for: ${opts.businessName}`, pageWidth / 2, 260, { align: 'center' });
    
    // Date
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 290, { align: 'center' });
    
    // Contents overview
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Document Contents', pageWidth / 2, 380, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const contents = [
      'Part 1: S3 Video Production Package',
      '• Complete asset specifications',
      '• AI generation prompts',
      '• Technical requirements',
      '',
      'Part 2: S4 Assembly Instructions',
      '• Timeline structure',
      '• Layer-by-layer breakdown',
      '• Export specifications',
    ];
    
    let contentY = 410;
    for (const item of contents) {
      doc.text(item, pageWidth / 2, contentY, { align: 'center' });
      contentY += 20;
    }
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('This document contains proprietary content. Do not distribute.', pageWidth / 2, pageHeight - 50, { align: 'center' });
  }
  
  // Add cover page
  addCoverPage();
  
  if (onProgress) onProgress(15);
  
  // Start S3 section
  doc.addPage();
  pageNumber = 2;
  currentY = margin;
  
  // S3 Section header
  doc.setFillColor(34, 197, 94); // Green
  doc.rect(0, 0, pageWidth, 60, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PART 1: S3 VIDEO PRODUCTION PACKAGE', pageWidth / 2, 38, { align: 'center' });
  
  currentY = 100;
  
  // Process S3 content
  const s3Lines = s3Content.split('\n');
  const totalLines = s3Lines.length + (s4Content ? s4Content.split('\n').length : 0);
  let processedLines = 0;
  
  for (const line of s3Lines) {
    processedLines++;
    
    // Update progress periodically
    if (processedLines % 50 === 0 && onProgress) {
      const progress = 15 + Math.round((processedLines / totalLines) * 60);
      onProgress(Math.min(progress, 75));
    }
    
    const isHeader = detectHeader(line);
    const isAssetName = detectAssetName(line);
    const isSeparator = detectSeparator(line);
    
    // Apply formatting
    if (isSeparator) {
      currentY += lineHeight * 0.5;
      continue;
    } else if (isHeader) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(opts.fontSize! + 2);
      doc.setTextColor(34, 197, 94); // Green for S3 headers
      currentY += 8;
    } else if (isAssetName) {
      doc.setFont('courier', 'normal');
      doc.setFontSize(opts.fontSize!);
      doc.setTextColor(59, 130, 246); // Blue for asset names
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(opts.fontSize!);
      doc.setTextColor(0, 0, 0);
    }
    
    // Split long lines
    const textLines = doc.splitTextToSize(line || ' ', maxWidth);
    
    for (const textLine of textLines) {
      if (currentY + lineHeight > pageHeight - 60) {
        addNewPage();
      }
      
      doc.text(textLine, margin, currentY);
      currentY += lineHeight;
    }
    
    if (isHeader) {
      currentY += 4;
    }
  }
  
  if (onProgress) onProgress(50);
  
  // S4 Section (new page with different color)
  doc.addPage();
  pageNumber++;
  currentY = margin;
  
  // S4 Section header
  doc.setFillColor(249, 115, 22); // Orange
  doc.rect(0, 0, pageWidth, 60, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PART 2: S4 ASSEMBLY INSTRUCTIONS', pageWidth / 2, 38, { align: 'center' });
  
  currentY = 100;
  
  // Process S4 content
  const s4Lines = s4Content.split('\n');
  
  for (const line of s4Lines) {
    processedLines++;
    
    if (processedLines % 50 === 0 && onProgress) {
      const progress = 50 + Math.round(((processedLines - s3Lines.length) / s4Lines.length) * 40);
      onProgress(Math.min(progress, 90));
    }
    
    const isHeader = detectHeader(line);
    const isAssetName = detectAssetName(line);
    const isSeparator = detectSeparator(line);
    
    if (isSeparator) {
      currentY += lineHeight * 0.5;
      continue;
    } else if (isHeader) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(opts.fontSize! + 2);
      doc.setTextColor(249, 115, 22); // Orange for S4 headers
      currentY += 8;
    } else if (isAssetName) {
      doc.setFont('courier', 'normal');
      doc.setFontSize(opts.fontSize!);
      doc.setTextColor(59, 130, 246);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(opts.fontSize!);
      doc.setTextColor(0, 0, 0);
    }
    
    const textLines = doc.splitTextToSize(line || ' ', maxWidth);
    
    for (const textLine of textLines) {
      if (currentY + lineHeight > pageHeight - 60) {
        addNewPage();
      }
      
      doc.text(textLine, margin, currentY);
      currentY += lineHeight;
    }
    
    if (isHeader) {
      currentY += 4;
    }
  }
  
  // Add final page number
  if (opts.addPageNumbers) {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 30, { align: 'center' });
  }
  
  if (onProgress) onProgress(95);
  
  // Return as blob
  const pdfBlob = doc.output('blob');
  
  if (onProgress) onProgress(100);
  
  return pdfBlob;
}

/**
 * Download a PDF blob with the given filename
 */
export function downloadPDFBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Extract business name from S3 content
 */
export function extractBusinessName(s3Content: string): string {
  const patterns = [
    /(?:Business|Company|Client|Project):\s*(.+?)(?:\n|$)/i,
    /(?:for|For)\s+(.+?)(?:\n|$)/,
    /^#\s*(.+?)(?:\n|$)/m,
    /Prepared for:\s*(.+?)(?:\n|$)/i,
  ];

  for (const pattern of patterns) {
    const match = s3Content.match(pattern);
    if (match && match[1]) {
      return match[1].trim().slice(0, 50);
    }
  }

  return 'Client';
}

/**
 * Generate comprehensive S6 Master PDF combining S3, S4, and S5
 *
 * @param s3Content - The S3 Video Production Package content
 * @param s4Content - The S4 Assembly Instructions content
 * @param s5Data - The S5 Stock Library Search Keywords (JSON)
 * @param options - PDF generation options
 * @param onProgress - Progress callback (0-100)
 * @returns PDF as Blob
 */
export async function generateS6ComprehensivePDF(
  s3Content: string,
  s4Content: string,
  s5Data: any,
  options?: Partial<PDFOptions>,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  opts.title = 'Complete Production Bible';

  let parsedS3 = s3Content;
  if (typeof s3Content === 'string') {
    parsedS3 = cleanMarkdownCodeFences(s3Content);
  }

  let parsedS4 = s4Content;
  if (typeof s4Content === 'string') {
    parsedS4 = cleanMarkdownCodeFences(s4Content);
  }

  let parsedS5 = s5Data;
  if (typeof s5Data === 'string') {
    try {
      const cleaned = cleanMarkdownCodeFences(s5Data);
      parsedS5 = JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse S5 data:', e);
      console.error('S5 data preview:', s5Data.substring(0, 200));
      throw new Error('S5 data is not valid JSON');
    }
  }

  if (onProgress) onProgress(5);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = opts.fontSize! * opts.lineSpacing!;

  let currentY = margin;
  let pageNumber = 1;

  function addNewPage() {
    if (opts.addPageNumbers) {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 30, { align: 'center' });
    }

    doc.addPage();
    pageNumber++;
    currentY = margin;

    if (opts.addHeader) {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('⚡ ELECTRIC STUDIO', margin, 30);
      if (opts.title) {
        doc.text(opts.title, pageWidth - margin, 30, { align: 'right' });
      }
      currentY = margin + 20;
    }
  }

  function addCoverPage() {
    doc.setFillColor(124, 58, 237);
    doc.rect(0, 0, pageWidth, 150, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('⚡ ELECTRIC STUDIO', pageWidth / 2, 60, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Complete Video Production Bible', pageWidth / 2, 85, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('Production Guide', pageWidth / 2, 220, { align: 'center' });

    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Prepared for: ${opts.businessName}`, pageWidth / 2, 260, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 290, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Complete Package Includes', pageWidth / 2, 380, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const contents = [
      'Section 1: Master Script & Asset List',
      'Section 2: Assembly Instructions',
      'Section 3: Stock Library Search Guide',
      'Section 4: Download Checklist',
      'Section 5: File Organization',
    ];

    let contentY = 410;
    for (const item of contents) {
      doc.text(item, pageWidth / 2, contentY, { align: 'center' });
      contentY += 20;
    }

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Everything you need to produce this video', pageWidth / 2, pageHeight - 50, { align: 'center' });
  }

  addCoverPage();

  if (onProgress) onProgress(10);

  doc.addPage();
  pageNumber = 2;
  currentY = margin;

  doc.setFillColor(34, 197, 94);
  doc.rect(0, 0, pageWidth, 60, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION 1: PRODUCTION PACKAGE', pageWidth / 2, 38, { align: 'center' });

  currentY = 100;

  const s3Lines = parsedS3.split('\n');
  const totalLines = s3Lines.length + parsedS4.split('\n').length;
  let processedLines = 0;

  for (const line of s3Lines) {
    processedLines++;

    if (processedLines % 50 === 0 && onProgress) {
      const progress = 10 + Math.round((processedLines / totalLines) * 30);
      onProgress(Math.min(progress, 40));
    }

    const isHeader = detectHeader(line);
    const isAssetName = detectAssetName(line);
    const isSeparator = detectSeparator(line);

    if (isSeparator) {
      currentY += lineHeight * 0.5;
      continue;
    } else if (isHeader) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(opts.fontSize! + 2);
      doc.setTextColor(34, 197, 94);
      currentY += 8;
    } else if (isAssetName) {
      doc.setFont('courier', 'normal');
      doc.setFontSize(opts.fontSize!);
      doc.setTextColor(59, 130, 246);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(opts.fontSize!);
      doc.setTextColor(0, 0, 0);
    }

    const textLines = doc.splitTextToSize(line || ' ', maxWidth);

    for (const textLine of textLines) {
      if (currentY + lineHeight > pageHeight - 60) {
        addNewPage();
      }

      doc.text(textLine, margin, currentY);
      currentY += lineHeight;
    }

    if (isHeader) {
      currentY += 4;
    }
  }

  if (onProgress) onProgress(40);

  doc.addPage();
  pageNumber++;
  currentY = margin;

  doc.setFillColor(249, 115, 22);
  doc.rect(0, 0, pageWidth, 60, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION 2: ASSEMBLY INSTRUCTIONS', pageWidth / 2, 38, { align: 'center' });

  currentY = 100;

  const s4Lines = parsedS4.split('\n');

  for (const line of s4Lines) {
    processedLines++;

    if (processedLines % 50 === 0 && onProgress) {
      const progress = 40 + Math.round(((processedLines - s3Lines.length) / s4Lines.length) * 30);
      onProgress(Math.min(progress, 70));
    }

    const isHeader = detectHeader(line);
    const isAssetName = detectAssetName(line);
    const isSeparator = detectSeparator(line);

    if (isSeparator) {
      currentY += lineHeight * 0.5;
      continue;
    } else if (isHeader) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(opts.fontSize! + 2);
      doc.setTextColor(249, 115, 22);
      currentY += 8;
    } else if (isAssetName) {
      doc.setFont('courier', 'normal');
      doc.setFontSize(opts.fontSize!);
      doc.setTextColor(59, 130, 246);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(opts.fontSize!);
      doc.setTextColor(0, 0, 0);
    }

    const textLines = doc.splitTextToSize(line || ' ', maxWidth);

    for (const textLine of textLines) {
      if (currentY + lineHeight > pageHeight - 60) {
        addNewPage();
      }

      doc.text(textLine, margin, currentY);
      currentY += lineHeight;
    }

    if (isHeader) {
      currentY += 4;
    }
  }

  if (onProgress) onProgress(70);

  doc.addPage();
  pageNumber++;
  currentY = margin;

  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, pageWidth, 60, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION 3: STOCK LIBRARY SEARCH GUIDE', pageWidth / 2, 38, { align: 'center' });

  currentY = 100;

  if (parsedS5 && parsedS5.assets) {
    for (const asset of parsedS5.assets) {
      if (currentY + 200 > pageHeight - 60) {
        addNewPage();
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(opts.fontSize! + 3);
      doc.setTextColor(124, 58, 237);
      doc.text(asset.assetName || 'Asset', margin, currentY);
      currentY += lineHeight * 1.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(opts.fontSize!);
      doc.setTextColor(0, 0, 0);

      const platforms = ['adobeStock', 'artlist', 'storyblocks', 'envatoElements'];
      for (const platform of platforms) {
        if (asset.searches && asset.searches[platform] && asset.searches[platform].length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(80, 80, 80);
          const platformName = platform.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
          doc.text(`${platformName}:`, margin, currentY);
          currentY += lineHeight;

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          for (const search of asset.searches[platform].slice(0, 3)) {
            doc.text(`  • ${search}`, margin, currentY);
            currentY += lineHeight;
          }
          currentY += lineHeight * 0.5;
        }
      }

      if (asset.selectionCriteria && asset.selectionCriteria.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(80, 80, 80);
        doc.text('SELECTION CRITERIA:', margin, currentY);
        currentY += lineHeight;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        for (const criteria of asset.selectionCriteria.slice(0, 3)) {
          const lines = doc.splitTextToSize(`  ✓ ${criteria}`, maxWidth);
          for (const line of lines) {
            if (currentY + lineHeight > pageHeight - 60) {
              addNewPage();
            }
            doc.text(line, margin, currentY);
            currentY += lineHeight;
          }
        }
      }

      currentY += lineHeight * 2;
    }
  }

  if (opts.addPageNumbers) {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 30, { align: 'center' });
  }

  if (onProgress) onProgress(95);

  const pdfBlob = doc.output('blob');

  if (onProgress) onProgress(100);

  return pdfBlob;
}
