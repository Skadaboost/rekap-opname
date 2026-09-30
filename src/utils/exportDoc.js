export const generateBeritaAcara = (nama, unitKerja, tanggalList) => {
  // Membuat baris tabel secara dinamis sebanyak jumlah tanggal bermasalah
  const tableRows = tanggalList
    .map(
      (tgl, index) => `
    <tr>
      <td style="padding: 5px; text-align: center;">${index + 1}</td>
      <td style="padding: 5px; text-align: center;">${tgl}</td>
      <td style="padding: 5px; text-align: center;">Masuk & Pulang</td>
      <td style="padding: 5px;"></td>
    </tr>
  `,
    )
    .join("");

  // Format HTML untuk MS Word
  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Berita Acara</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; }
        .tengah { text-align: center; }
        .tebal { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; }
      </style>
    </head>
    <body>
      <h3 class="tengah">BERITA ACARA ABSENSI BERMASALAH</h3>
      <p>Pada hari ini, .......................... Tanggal .................................., bertempat di Workshop Sukamaju, saya yang bertanda tangan di bawah ini :</p>
      
      <table style="border: none;">
        <tr><td style="width: 15%;">Nama</td><td style="width: 85%;">: ${nama}</td></tr>
        <tr><td>Unit Kerja</td><td>: ${unitKerja}</td></tr>
        <tr><td>Proyek</td><td>: Workshop Sukamaju</td></tr>
      </table>
      
      <p>Bahwa pekerja tersebut tidak dapat menggunakan aplikasi absensi pada :</p>
      
      <table border="1" style="text-align: center; width: 100%; border-collapse: collapse;">
        <tr>
          <th style="padding: 5px; width: 10%;">No</th>
          <th style="padding: 5px; width: 30%;">Tanggal</th>
          <th style="padding: 5px; width: 25%;">Absen</th>
          <th style="padding: 5px; width: 35%;">Alasan</th>
        </tr>
        ${tableRows}
      </table>
      
      <p>Sehingga absensi harus dibackup dengan mesin finger dan kartu amano. Oleh karena itu, saya mohon agar absensi selama periode tersebut tidak dihitung sebagai ketidakhadiran.</p>
      <p>Demikian berita acara ini dibuat atas perhatiannya dan bantuannya saya ucapkan terima kasih.</p>
      <br><br>
      
      <table style="border: none; text-align: center;">
        <tr>
          <td style="width: 33%;"><b>Dibuat Oleh,</b><br><br><br><br><br><u><b>${nama}</b></u><br>${unitKerja}</td>
          <td style="width: 33%;"><b>Mengetahui,</b><br><br><br><br><br><u><b>Fajar Sukarno</b></u><br>Ka Workshop</td>
          <td style="width: 33%;"><b> </b><br><br><br><br><br><u><b>Budi Pranoto</b></u><br>Manajer Workshop</td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Proses konversi dan download ke .doc
  const blob = new Blob(["\ufeff", htmlContent], {
    type: "application/msword",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Berita_Acara_Absensi_${nama.replace(/\s+/g, "_")}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
