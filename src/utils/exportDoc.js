// Helper untuk format HTML Berita Acara 1 Pekerja
const buildSingleHtml = (nama, unitKerja, tanggalList) => {
  const tableRows = tanggalList
    .map(
      (tgl, index) => `
    <tr>
      <td style="padding: 6px; text-align: center; border: 1px solid black;">${index + 1}</td>
      <td style="padding: 6px; text-align: center; border: 1px solid black;">${tgl}</td>
      <td style="padding: 6px; text-align: center; border: 1px solid black;">Masuk & Pulang</td>
      <td style="padding: 6px; border: 1px solid black;"></td>
    </tr>
  `,
    )
    .join("");

  return `
    <div class="ba-page">
      <h3 style="text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 20px; text-transform: uppercase;">
        BERITA ACARA ABSENSI BERMASALAH
      </h3>
      
      <p style="text-align: justify; line-height: 1.5; margin-bottom: 15px;">
        Pada hari ini, .......................... Tanggal .................................., bertempat di Workshop Sukamaju, saya yang bertanda tangan di bawah ini :
      </p>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; line-height: 1.6;">
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
      
      <p style="line-height: 1.5; margin-bottom: 10px;">
        Bahwa pekerja tersebut tidak dapat menggunakan aplikasi absensi pada :
      </p>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 6px; width: 10%; border: 1px solid black; text-align: center;">No</th>
            <th style="padding: 6px; width: 30%; border: 1px solid black; text-align: center;">Tanggal</th>
            <th style="padding: 6px; width: 25%; border: 1px solid black; text-align: center;">Absen</th>
            <th style="padding: 6px; width: 35%; border: 1px solid black; text-align: center;">Alasan</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      
      <p style="text-align: justify; line-height: 1.5; margin-bottom: 10px;">
        Sehingga absensi harus dibackup dengan mesin finger dan kartu amano. Oleh karena itu, saya mohon agar absensi selama periode tersebut tidak dihitung sebagai ketidakhadiran.
      </p>
      
      <p style="text-align: justify; line-height: 1.5; margin-bottom: 35px;">
        Demikian berita acara ini dibuat atas perhatiannya dan bantuannya saya ucapkan terima kasih.
      </p>
      
      <table style="width: 100%; border-collapse: collapse; text-align: center;">
        <tr>
          <td style="width: 33%; vertical-align: top;">
            <b>Dibuat Oleh,</b><br><br><br><br><br>
            <u><b>${nama}</b></u><br>
            ${unitKerja}
          </td>
          <td style="width: 33%; vertical-align: top;">
            <b>Mengetahui,</b><br><br><br><br><br>
            <u><b>Fajar Sukarno</b></u><br>
            Ka Workshop
          </td>
          <td style="width: 33%; vertical-align: top;">
            <b> </b><br><br><br><br><br>
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

  // Gabungkan seluruh BA dan sisipkan instruksi hard page break MS Word di antara tiap BA
  const combinedBody = pekerjaBermasalahList
    .map((p, index) => {
      const pageHtml = buildSingleHtml(p.nama, p.unitKerja, p.tanggalList);
      if (index < pekerjaBermasalahList.length - 1) {
        return (
          pageHtml +
          '<br clear="all" style="page-break-before:always; mso-break-type:section-break;" />'
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
        @page {
          size: A4 portrait;
          margin: 2cm 2cm 2cm 2cm;
        }
        body {
          font-family: 'Times New Roman', serif;
          font-size: 11pt;
          color: #000000;
        }
        .ba-page {
          width: 100%;
        }
        table {
          border-collapse: collapse;
        }
      </style>
    </head>
    <body>
      ${htmlBodyContent}
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
