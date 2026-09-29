// src/lib/generate-period-docx.ts
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
} from "docx";
import { IPeriodSummaryReport } from "./docx/period-report";

// ✅ Fix: AlignmentType এর যেকোনো value accept করার জন্য type
type DocxAlign = (typeof AlignmentType)[keyof typeof AlignmentType];

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export async function generatePeriodDocx(
  data: IPeriodSummaryReport,
): Promise<Blob> {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const headerCell = (text: string, align: DocxAlign = AlignmentType.LEFT) =>
    new TableCell({
      shading: { fill: "E8F5E9" },
      children: [
        new Paragraph({
          alignment: align,
          children: [
            new TextRun({ text, bold: true, size: 22, color: "1B5E20" }),
          ],
        }),
      ],
    });

  const bodyCell = (
    text: string,
    align: DocxAlign = AlignmentType.LEFT,
    bold = false,
  ) =>
    new TableCell({
      children: [
        new Paragraph({
          alignment: align,
          children: [new TextRun({ text, bold, size: 22 })],
        }),
      ],
    });

  const tableRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        headerCell("Category"),
        headerCell("Items", AlignmentType.CENTER),
        headerCell("Amount (BDT)", AlignmentType.RIGHT),
      ],
    }),
    ...data.breakdown.map(
      (b) =>
        new TableRow({
          children: [
            bodyCell(b.categoryName),
            bodyCell(String(b.count), AlignmentType.CENTER),
            bodyCell(
              `৳${b.total.toLocaleString("en-US")}`,
              AlignmentType.RIGHT,
            ),
          ],
        }),
    ),
    new TableRow({
      children: [
        new TableCell({
          shading: { fill: "F5F5F5" },
          children: [
            new Paragraph({
              children: [new TextRun({ text: "TOTAL", bold: true, size: 22 })],
            }),
          ],
        }),
        new TableCell({
          shading: { fill: "F5F5F5" },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: String(data.totalCount),
                  bold: true,
                  size: 22,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          shading: { fill: "F5F5F5" },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: `৳${data.totalAmount.toLocaleString("en-US")}`,
                  bold: true,
                  size: 22,
                  color: "C62828",
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: "Amar Kharcha",
                bold: true,
                size: 40,
                color: "2E7D32",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 500 },
            children: [
              new TextRun({
                text: "Expense Report",
                size: 26,
                color: "666666",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: "Period:  ", bold: true, size: 22 }),
              new TextRun({ text: data.period.name, size: 22 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: "Date Range:  ", bold: true, size: 22 }),
              new TextRun({
                text: `${formatDate(
                  data.period.startDate,
                )}  –  ${formatDate(data.period.endDate)}`,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 400 },
            children: [
              new TextRun({ text: "Generated:  ", bold: true, size: 22 }),
              new TextRun({ text: today, size: 22 }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
              left: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
              right: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
              insideHorizontal: {
                style: BorderStyle.SINGLE,
                size: 2,
                color: "E0E0E0",
              },
              insideVertical: {
                style: BorderStyle.SINGLE,
                size: 2,
                color: "E0E0E0",
              },
            },
          }),
          new Paragraph({ spacing: { before: 1400 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: "___________________________",
                color: "999999",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: "Mursalin Hossain",
                bold: true,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Date: ${today}`,
                size: 20,
                color: "666666",
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function slugifyFilename(name: string) {
  return name.replace(/[^a-z0-9]/gi, "_");
}
