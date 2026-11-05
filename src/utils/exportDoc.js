// Helper untuk format HTML Berita Acara 1 Pekerja
const buildSingleHtml = (nama, unitKerja, tanggalList) => {
  const tableRows = tanggalList
    .map(
      (tgl, index) => `
    <tr>
      <td style="padding: 4px; text-align: center; border: 1px solid black;">${index + 1}</td>
      <td style="padding: 4px; text-align: center; border: 1px solid black;">${tgl}</td>
      <td style="padding: 4px; text-align: center; border: 1px solid black;">Masuk & Pulang</td>
      <td style="padding: 4px; border: 1px solid black;"></td>
    </tr>
  `,
    )
    .join("");

  return `
    <div class="ba-container">
      <h3 style="text-align: center; font-size: 13pt; font-weight: bold; margin-top: 0; margin-bottom: 12px; text-transform: uppercase;">
        BERITA ACARA ABSENSI BERMASALAH
      </h3>
      
      <p style="text-align: justify; line-height: 1.3; margin-bottom: 10px;">
        Pada hari ini, .......................... Tanggal .................................., bertempat di Workshop Sukamaju, saya yang bertanda tangan di bawah ini :
      </p>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; line-height: 1.4;">
        <tr>
          <td style="width: 18%; vertical-align: top;">Nama</td>
          <td style="width: 82%;">: <b>${nama}</b></td>
        </tr>
        <tr>
          <td style="vertical-align: top;">Unit Kerja</td>
          <td>: ${unitKerja}</td>
        </tr>
        <tr>
          <td style="vertical-align: top;">Proyek</td>
          <td>: Workshop Sukamaju</td>
        </tr>
      </table>
      
      <p style="line-height: 1.3; margin-bottom: 8px;">
        Bahwa pekerja tersebut tidak dapat menggunakan aplikasi absensi pada :
      </p>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 4px; width: 10%; border: 1px solid black; text-align: center;">No</th>
            <th style="padding: 4px; width: 30%; border: 1px solid black; text-align: center;">Tanggal</th>
            <th style="padding: 4px; width: 25%; border: 1px solid black; text-align: center;">Absen</th>
            <th style="padding: 4px; width: 35%; border: 1px solid black; text-align: center;">Alasan</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      
      <p style="text-align: justify; line-height: 1.3; margin-bottom: 8px;">
        Sehingga absensi harus dibackup dengan mesin finger dan kartu amano. Oleh karena itu, saya mohon agar absensi selama periode tersebut tidak dihitung sebagai ketidakhadiran.
      </p>
      
      <p style="text-align: justify; line-height: 1.3; margin-bottom: 20px;">
        Demikian berita acara ini dibuat atas perhatiannya dan bantuannya saya ucapkan terima kasih.
      </p>
      
      <table style="width: 100%; border-collapse: collapse; text-align: center;">
        <tr>
          <td style="width: 33%; vertical-align: top;">
            <b>Dibuat Oleh,</b><br><br><br><br>
            <u><b>${nama}</b></u><br>
            ${unitKerja}
          </td>
          <td style="width: 33%; vertical-align: top;">
            <b>Mengetahui,</b><br><br><br><br>
            <u><b>Fajar Sukarno</b></u><br>
            Ka Workshop
          </td>
          <td style="width: 33%; vertical-align: top;">
            <b> </b><br><br><br><br>
            <u><b>Budi Pranoto</b></u><br>
            Manajer Workshop
          </td>
        </tr>
      </table>
    </div>
  `;
};

// 1. DIBUAT 1 PER 1 (PER PEKERJA)
export const generateBeritaAcara = (nama, unitKerja, tanggalList) => {
  const htmlBody = buildSingleHtml(nama, unitKerja, tanggalList);
  downloadDoc(htmlBody, `Berita_Acara_${nama.replace(/\s+/g, "_")}.doc`);
};

// 2. DISATUKAN JADI 1 FILE GABUNGAN (SEMUA PEKERJA BERMASALAH)
export const generateBeritaAcaraMassal = (
  pekerjaBermasalahList,
  periodeText = "",
) => {
  if (pekerjaBermasalahList.length === 0) {
    alert("Tidak ada pekerja yang memiliki absensi bermasalah!");
    return;
  }

  // Paragraf khusus penanda pemutus halaman (Page Break) untuk Microsoft Word
  const combinedBody = pekerjaBermasalahList
    .map((p, index) => {
      const pageHtml = buildSingleHtml(p.nama, p.unitKerja, p.tanggalList);
      if (index < pekerjaBermasalahList.length - 1) {
        return (
          pageHtml +
          '<p style="page-break-before: always; mso-break-type: section-break; margin: 0; padding: 0;"></p>'
        );
      }
      return pageHtml;
    })
    .join("");

  downloadDoc(
    combinedBody,
    `Berita_Acara_Gabungan_${periodeText.replace(/\s+/g, "_")}.doc`,
  );
};

// Helper proses download
const downloadDoc = (htmlBodyContent, fileName) => {
  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Berita Acara</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page WordSection1 {
          size: 595.3pt 841.9pt; /* Ukuran A4 */
          margin: 1.5cm 2cm 1.5cm 2cm;
          mso-header-margin: 36.0pt;
          mso-footer-margin: 36.0pt;
        }
        div.WordSection1 {
          page: WordSection1;
        }
        body {
          font-family: 'Times New Roman', serif;
          font-size: 11pt;
          color: #000000;
        }
        p {
          margin: 0;
          padding: 0;
        }
      </style>
    </head>
    <body>
      <div class="WordSection1">
        ${htmlBodyContent}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(["\ufeff", htmlContent], {
    type: "application/msword",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
