import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, AlignmentType } from "docx";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";

export const exportService = {
  async toDocx(reportTitle: string, content: string) {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: reportTitle,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          ...content.split('\n').map(line => new Paragraph({
            children: [new TextRun(line)],
            spacing: { before: 200 }
          }))
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${reportTitle.replace(/\s+/g, '_')}.docx`);
  },

  async toPdf(reportTitle: string, content: string) {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(reportTitle, 105, 20, { align: "center" });
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 15, 40);
    doc.save(`${reportTitle.replace(/\s+/g, '_')}.pdf`);
  }
};
