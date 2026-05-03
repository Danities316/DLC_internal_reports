import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, AlignmentType, WidthType } from "docx";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { saveAs } from "file-saver";

export const exportService = {
  async toDocx(reportTitle: string, content: string) {
    const children: any[] = [
      new Paragraph({
        text: reportTitle,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: "", spacing: { after: 400 } })
    ];

    let tableRows: any[] = [];

    const lines = content.split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('|')) {
        // Skip markdown table separator lines
        if (line.includes('---')) continue;
        
        // Parse row
        const rawCells = line.split('|').slice(1, -1); 
        tableRows.push(
          new TableRow({
            children: rawCells.map(c => new TableCell({
              children: [new Paragraph({
                text: c.trim().replace(/\*\*/g, ''),
                spacing: { before: 100, after: 100 }
              })],
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            }))
          })
        );
      } else {
        // If we were building a table and it ended
        if (tableRows.length > 0) {
          children.push(new Table({ 
            rows: tableRows, 
            width: { size: 100, type: WidthType.PERCENTAGE },
          }));
          children.push(new Paragraph({ text: "", spacing: { before: 200 } })); // Empty line after table
          tableRows = [];
        }
        
        // Push normal text
        if (line.trim() !== '') {
          if (line.trim() === '---') {
            children.push(new Paragraph({ text: "", pageBreakBefore: true }));
          } else if (line.startsWith('### ')) {
            children.push(new Paragraph({
              text: line.replace('### ', '').replace(/\*\*/g, '').trim(),
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 400, after: 200 }
            }));
          } else if (line.startsWith('## ')) {
            children.push(new Paragraph({
              text: line.replace('## ', '').replace(/\*\*/g, '').trim(),
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }));
          } else if (line.startsWith('# ')) {
             children.push(new Paragraph({
              text: line.replace('# ', '').replace(/\*\*/g, '').trim(),
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 }
            }));
          } else {
            children.push(new Paragraph({
              text: line.replace(/\*\*/g, '').replace(/_x000D_/g, ''),
              spacing: { before: 100, after: 100 }
            }));
          }
        }
      }
    }
    
    // In case the file ended with a table
    if (tableRows.length > 0) {
      children.push(new Table({ 
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
      }));
    }

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: "Comic Sans MS",
              size: 24,
            },
          },
        },
      },
      sections: [{
        properties: {},
        children: children
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${reportTitle.replace(/\s+/g, '_')}.docx`);
  },

  async toPdf(reportTitle: string, content: string) {
    const doc = new jsPDF({ orientation: "landscape" });
    
    let y = 20;
    const margin = 15;
    
    const lines = content.split('\n');
    let tableBody: any[] = [];
    let tableHead: any[] = [];
    let inTable = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('|')) {
        inTable = true;
        if (line.includes('---')) continue;
        
        const cells = line.split('|').slice(1, -1).map(c => c.trim().replace(/\*\*/g, ''));
        if (tableHead.length === 0) {
          tableHead = [cells];
        } else {
          tableBody.push(cells);
        }
      } else {
        if (inTable) {
          autoTable(doc, {
            head: tableHead,
            body: tableBody,
            startY: y,
            theme: 'grid',
            headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 3, textColor: 20, lineColor: [200, 200, 200], lineWidth: 0.1 },
            margin: { left: margin, right: margin }
          });
          y = (doc as any).lastAutoTable.finalY + 10;
          tableHead = [];
          tableBody = [];
          inTable = false;
        }
        
        if (line.trim() !== '') {
          if (line.trim() === '---') {
            doc.addPage();
            y = 20;
            continue;
          }
          
          let text = line.replace(/\*\*/g, '');
          let fontSize = 10;
          let fontStyle = "normal";
          
          if (text.startsWith('### ')) {
            text = text.replace('### ', '');
            fontSize = 12;
            fontStyle = "bold";
            y += 5;
          } else if (text.startsWith('## ')) {
            text = text.replace('## ', '');
            fontSize = 14;
            fontStyle = "bold";
            y += 5;
          } else if (text.startsWith('# ')) {
            text = text.replace('# ', '');
            fontSize = 16;
            fontStyle = "bold";
            y += 5;
          }
          
          doc.setFontSize(fontSize);
          doc.setFont("helvetica", fontStyle);
          const splitText = doc.splitTextToSize(text, doc.internal.pageSize.getWidth() - (margin * 2));
          
          if (y + (splitText.length * 5) > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = 20;
          }
          
          doc.text(splitText, margin, y);
          y += splitText.length * 5;
        }
      }
    }
    
    if (inTable) {
      autoTable(doc, {
        head: tableHead,
        body: tableBody,
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3, textColor: 20, lineColor: [200, 200, 200], lineWidth: 0.1 },
        margin: { left: margin, right: margin }
      });
    }

    doc.save(`${reportTitle.replace(/\s+/g, '_')}.pdf`);
  }
};
