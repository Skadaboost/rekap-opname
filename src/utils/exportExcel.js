import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// --- FUNGSI HELPER: UBAH ANGKA JADI TEKS (TERBILANG) ---
const angkaTerbilang = (nilai) => {
  const huruf = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];
  let hasil = "";
  if (nilai < 12) hasil = " " + huruf[nilai];
  else if (nilai < 20) hasil = angkaTerbilang(nilai - 10) + " Belas";
  else if (nilai < 100)
    hasil =
      angkaTerbilang(Math.floor(nilai / 10)) +
      " Puluh" +
      angkaTerbilang(nilai % 10);
  else if (nilai < 200) hasil = " Seratus" + angkaTerbilang(nilai - 100);
  else if (nilai < 1000)
    hasil =
      angkaTerbilang(Math.floor(nilai / 100)) +
      " Ratus" +
      angkaTerbilang(nilai % 100);
  else if (nilai < 2000) hasil = " Seribu" + angkaTerbilang(nilai - 1000);
  else if (nilai < 1000000)
    hasil =
      angkaTerbilang(Math.floor(nilai / 1000)) +
      " Ribu" +
      angkaTerbilang(nilai % 1000);
  else if (nilai < 1000000000)
    hasil =
      angkaTerbilang(Math.floor(nilai / 1000000)) +
      " Juta" +
      angkaTerbilang(nilai % 1000000);
  else if (nilai < 1000000000000)
    hasil =
      angkaTerbilang(Math.floor(nilai / 1000000000)) +
      " Milyar" +
      angkaTerbilang(nilai % 1000000000);
  return hasil;
};
const convertTerbilang = (nilai) => {
  if (nilai === 0) return "Nol Rupiah";
  return angkaTerbilang(Math.round(nilai)).trim() + " Rupiah";
};

export const generateExcel = async (tanggalList, rekapData) => {
  const savedData = localStorage.getItem("dataPekerja");
  const pekerjaDB = savedData ? JSON.parse(savedData) : [];

  // Urutkan berdasarkan Unit Kerja lalu Nama
  const sortedRekapData = [...rekapData].sort((a, b) => {
    const dbA =
      pekerjaDB.find(
        (p) => p.nama.toLowerCase().trim() === a.nama.toLowerCase().trim(),
      ) || {};
    const dbB =
      pekerjaDB.find(
        (p) => p.nama.toLowerCase().trim() === b.nama.toLowerCase().trim(),
      ) || {};

    const unitA = (dbA.unitKerja || "WORKSHOP").toLowerCase();
    const unitB = (dbB.unitKerja || "WORKSHOP").toLowerCase();
    if (unitA < unitB) return -1;
    if (unitA > unitB) return 1;

    const namaA = (a.nama || "").toLowerCase();
    const namaB = (b.nama || "").toLowerCase();
    return namaA.localeCompare(namaB);
  });

  const wb = new ExcelJS.Workbook();
  const periodeText =
    tanggalList.length > 0
      ? `${tanggalList[0]} s.d. ${tanggalList[tanggalList.length - 1]}`
      : "";

  // Format Ribuan Standar Akuntansi Excel
  const formatRibuan = '_(* #,##0_);_(* (#,##0);_(* "-"??_);_(@_)';

  // =========================================================================
  // SHEET 1: ABSEN
  // =========================================================================
  const wsAbsen = wb.addWorksheet("Absen");
  wsAbsen.getCell("D1").value =
    "REKAP GAJI TENAGA KERJA HARIAN WORKSHOP SUKAMAJU";
  wsAbsen.getCell("D1").font = { bold: true, size: 14 };
  wsAbsen.getCell("A2").value = "Bagian : WORKSHOP";
  wsAbsen.getCell("A3").value = `Periode : ${periodeText}`;

  const headerAbsen1 = ["NO", "NAMA", "Unit Kerja"];
  const headerAbsen2 = ["", "", ""];

  tanggalList.forEach((tgl) => {
    headerAbsen1.push(tgl.substring(0, 5), "");
    headerAbsen2.push("H", "L");
  });
  headerAbsen1.push("Total", "", "UM");
  headerAbsen2.push("Hari", "Lembur", "");

  wsAbsen.addRow(headerAbsen1);
  wsAbsen.addRow(headerAbsen2);

  wsAbsen.mergeCells("A4:A5");
  wsAbsen.mergeCells("B4:B5");
  wsAbsen.mergeCells("C4:C5");
  let colAbsen = 4;
  tanggalList.forEach(() => {
    wsAbsen.mergeCells(4, colAbsen, 4, colAbsen + 1);
    colAbsen += 2;
  });
  wsAbsen.mergeCells(4, colAbsen, 4, colAbsen + 1);
  wsAbsen.mergeCells(4, colAbsen + 2, 5, colAbsen + 2);

  [4, 5].forEach((r) =>
    wsAbsen.getRow(r).eachCell({ includeEmpty: true }, (c) => {
      c.font = { bold: true };
      c.alignment = { horizontal: "center", vertical: "middle" };
      c.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }),
  );

  sortedRekapData.forEach((pekerja, index) => {
    const db =
      pekerjaDB.find(
        (p) =>
          p.nama.toLowerCase().trim() === pekerja.nama.toLowerCase().trim(),
      ) || {};
    let totalH = 0;
    let totalL = 0;
    let totalUM = 0;
    const rowData = [index + 1, pekerja.nama, db.unitKerja || "WORKSHOP"];

    tanggalList.forEach((tgl) => {
      const h = pekerja.absen[tgl]?.H || 0;
      const l = pekerja.absen[tgl]?.L || 0;
      totalUM += pekerja.absen[tgl]?.UM || 0;
      totalH += h;
      totalL += l;
      rowData.push(h, l);
    });

    rowData.push(totalH, totalL, totalUM);
    const dataRow = wsAbsen.addRow(rowData);
    dataRow.eachCell({ includeEmpty: true }, (c, num) => {
      c.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      c.alignment = { vertical: "middle" };
      if (num >= 4) {
        c.alignment = { horizontal: "center", vertical: "middle" };
        if (c.value === 0) c.value = "";
        else c.numFmt = "0.0";
      }
    });
  });

  wsAbsen.getColumn(1).width = 5;
  wsAbsen.getColumn(2).width = 25;
  wsAbsen.getColumn(3).width = 15;
  for (let i = 4; i <= 3 + tanggalList.length * 2 + 3; i++)
    wsAbsen.getColumn(i).width = 5;

  // =========================================================================
  // SHEET 2: REKAP
  // =========================================================================
  const wsRekap = wb.addWorksheet("Rekap");

  wsRekap.getCell("A1").value = "PT MULTIBANGUN ADHITAMA KONSTRUKSI";
  wsRekap.getCell("A1").font = { bold: true };
  wsRekap.getCell("A2").value = "PROYEK WORKSHOP SUKAMAJU";
  wsRekap.getCell("A2").font = { bold: true };
  wsRekap.getCell("A3").value = "BOGOR";
  wsRekap.getCell("A3").font = { bold: true };

  wsRekap.getCell("D5").value = "REKAPITULASI OPNAME HARIAN";
  wsRekap.getCell("D5").font = { bold: true, size: 14 };
  wsRekap.getCell("A6").value = `Periode                : ${periodeText}`;

  const headerRekap = [
    "NO.",
    "NAMA",
    "UNIT KERJA",
    "JUMLAH HARI",
    "UPAH (Rp/Hari)",
    "JUMLAH JAM LEMBUR",
    "UPAH (Rp/Jam)",
    "JUMLAH JAM UM",
    "UPAH (Rp/Jam)",
    "JUMLAH (Rp)",
    "BANK",
    "NOMOR REKENING",
    "ATAS NAMA REKENING",
  ];
  const rekapHeaderRow = wsRekap.addRow(headerRekap);
  rekapHeaderRow.height = 30;

  rekapHeaderRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  let currentUnit = null;
  let groupSubtotal = 0;
  let grandTotal = 0;
  let noUrut = 1;

  const applyBorder = (row) => {
    row.eachCell({ includeEmpty: true }, (c) => {
      c.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      c.alignment = { vertical: "middle" };
    });
  };

  sortedRekapData.forEach((pekerja, index) => {
    const db =
      pekerjaDB.find(
        (p) =>
          p.nama.toLowerCase().trim() === pekerja.nama.toLowerCase().trim(),
      ) || {};
    const unitKerja = (db.unitKerja || "UMUM").toUpperCase();

    // Header Grup Unit Kerja
    if (currentUnit !== unitKerja) {
      if (currentUnit !== null) {
        const subRow = wsRekap.addRow([
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          groupSubtotal,
          "",
          "",
          "",
        ]);
        applyBorder(subRow);
        subRow.getCell(10).font = { bold: true };
        subRow.getCell(10).numFmt = formatRibuan; // Format Ribuan Subtotal
        wsRekap.addRow([]); // Spacer
      }
      const headerGroupRow = wsRekap.addRow([
        "",
        unitKerja,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]);
      applyBorder(headerGroupRow);
      headerGroupRow.getCell(2).font = { bold: true };

      currentUnit = unitKerja;
      groupSubtotal = 0;
      noUrut = 1;
    }

    let totalH = 0;
    let totalL = 0;
    let totalUM = 0;
    tanggalList.forEach((tgl) => {
      totalH += pekerja.absen[tgl]?.H || 0;
      totalL += pekerja.absen[tgl]?.L || 0;
      totalUM += pekerja.absen[tgl]?.UM || 0;
    });

    const upahHarian = Number(db.upahHarian) || 0;
    const upahLembur = Number(db.upahLembur) || 0;
    const nominalUM = 15000;

    const subtotalHarian = totalH * upahHarian;
    const subtotalLembur = totalL * upahLembur;
    const subtotalUM = totalUM * nominalUM;
    const totalDiterima = subtotalHarian + subtotalLembur + subtotalUM;

    groupSubtotal += totalDiterima;
    grandTotal += totalDiterima;

    const rowData = [
      noUrut++,
      pekerja.nama,
      db.unitKerja || "UMUM",
      totalH,
      upahHarian,
      totalL,
      upahLembur,
      totalUM,
      nominalUM,
      totalDiterima,
      db.bank || "",
      db.rekening || "",
      db.atasNama || "",
    ];

    const dataRow = wsRekap.addRow(rowData);
    applyBorder(dataRow);

    // FORMAT KOLOM INDIVIDUAL
    dataRow.eachCell((cell, colNum) => {
      if ([1, 4, 6, 8, 11].includes(colNum))
        cell.alignment = { horizontal: "center", vertical: "middle" };
      if ([4, 6, 8].includes(colNum)) {
        if (cell.value === 0) cell.value = "-";
        else cell.numFmt = "0.0";
      }

      // Menerapkan Format Ribuan untuk kolom Uang (Kolom 5, 7, 9, 10)
      if ([5, 7, 9, 10].includes(colNum)) {
        cell.numFmt = formatRibuan;
      }
    });
  });

  // Subtotal Grup Terakhir
  if (currentUnit !== null) {
    const subRow = wsRekap.addRow([
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      groupSubtotal,
      "",
      "",
      "",
    ]);
    applyBorder(subRow);
    subRow.getCell(10).font = { bold: true };
    subRow.getCell(10).numFmt = formatRibuan;
  }

  // GRAND TOTAL
  wsRekap.addRow([]); // Spacer
  const grandTotalRow = wsRekap.addRow([
    "JUMLAH",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    grandTotal,
    "",
    "",
    "",
  ]);
  wsRekap.mergeCells(`A${grandTotalRow.number}:I${grandTotalRow.number}`);

  ["A", "J", "K", "L", "M"].forEach((col) => {
    grandTotalRow.getCell(col).border = {
      top: { style: "thick" },
      left: { style: "thin" },
      bottom: { style: "thick" },
      right: { style: "thin" },
    };
  });
  grandTotalRow.getCell("A").font = { bold: true };
  grandTotalRow.getCell("J").font = { bold: true };
  grandTotalRow.getCell("J").numFmt = formatRibuan; // Format Ribuan Grand Total

  // TERBILANG
  const terbilangRow = wsRekap.addRow([
    "Terbilang :",
    convertTerbilang(grandTotal),
  ]);
  wsRekap.mergeCells(`B${terbilangRow.number}:M${terbilangRow.number}`);
  terbilangRow.getCell("A").font = { italic: true };
  terbilangRow.getCell("B").font = { italic: true, bold: true };

  // TANDA TANGAN
  wsRekap.addRow([]);
  wsRekap.addRow([]);
  wsRekap.addRow([
    "",
    "Bogor, ........................... 202...",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  wsRekap.addRow([
    "",
    "Personalia,",
    "",
    "",
    "Kabag. Logistik,",
    "",
    "",
    "Kepala Workshop,",
    "",
    "",
    "Manajer Workshop,",
    "",
    "",
  ]);
  wsRekap.addRow([]);
  wsRekap.addRow([]);
  wsRekap.addRow([]);

  const namaTtd = wsRekap.addRow([
    "",
    "Hadid I",
    "",
    "",
    "Robi S",
    "",
    "",
    "Fajar S",
    "",
    "",
    "Budi Pranoto",
    "",
    "",
  ]);
  namaTtd.eachCell((c) => {
    c.font = { bold: true };
    c.alignment = { horizontal: "left" };
  });

  wsRekap.columns = [
    { width: 5 },
    { width: 25 },
    { width: 18 },
    { width: 10 },
    { width: 15 },
    { width: 12 },
    { width: 15 },
    { width: 10 },
    { width: 15 },
    { width: 18 },
    { width: 10 },
    { width: 20 },
    { width: 25 },
  ];

  // =========================================================================
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `Rekap_Opname_${periodeText}.xlsx`);
};
