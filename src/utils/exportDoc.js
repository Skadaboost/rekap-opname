export const generateSemuaBeritaAcara = (daftarPekerja) => {
  if (!daftarPekerja || daftarPekerja.length === 0) {
    alert("Tidak ada data pekerja yang bermasalah.");
    return;
  }

  // Melakukan perulangan (loop) untuk membuat halaman bagi setiap pekerja
  const pagesHtml = daftarPekerja
    .map((pekerja, index) => {
      // Membuat baris tabel untuk setiap tanggal yang bermasalah pada pekerja ini
      const tableRows = pekerja.tanggalList
        .map(
          (tgl, i) => `
      <tr>
        <td style="padding: 5px; text-align: center;">${i + 1}</td>
        <td style="padding: 5px; text-align: center;">${tgl}</td>
        <td style="padding: 5px; text-align: center;">Masuk & Pulang</td>
        <td style="padding: 5px;"></td>
      </tr>
    `,
        )
        .join("");

      // Template untuk satu halaman Berita Acara
      const halamanTemplate = `
      <div>
        <h3 class="tengah">BERITA ACARA ABSENSI BERMASALAH</h3>
        <p>Pada hari ini, .......................... Tanggal .................................., bertempat di Workshop Sukamaju, saya yang bertanda tangan di bawah ini :</p>
        
        <table style="border: none; width: 100%;">
          <tr><td style="width: 15%;">Nama</td><td style="width: 85%;">: ${pekerja.nama}</td></tr>
          <tr><td>Unit Kerja</td><td>: ${pekerja.unitKerja}</td></tr>
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
        
        <table style="border: none; text-align: center; width: 100%;">
          <tr>
            <td style="width: 33%;"><b>Dibuat Oleh,</b><br><br><br><br><br><u><b>${pekerja.nama}</b></u><br>${pekerja.unitKerja}</td>
            <td style="width: 33%;"><b>Mengetahui,</b><br><br><br><br><br><u><b>Roby S</b></u><br>Ka. Gudang Workshop</td>
            <td style="width: 33%;"><b> </b><br><br><br><br><br><u><b>Budi Pranoto</b></u><br>Manajer Workshop</td>
          </tr>
        </table>
      </div>
    `;

      // Jika ini bukan pekerja terakhir, tambahkan kode "Page Break" agar pindah halaman di MS Word
      const pageBreak =
        index < daftarPekerja.length - 1
          ? '<br clear="all" style="page-break-before:always" />'
          : "";

      return halamanTemplate + pageBreak;
    })
    .join("");

  // Membungkus seluruh halaman menjadi satu dokumen HTML untuk Word
  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Kumpulan Berita Acara</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; }
        .tengah { text-align: center; }
        .tebal { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; }
      </style>
    </head>
    <body>
      ${pagesHtml}
    </body>
    </html>
  `;

  // Proses konversi dan download
  const blob = new Blob(["\ufeff", htmlContent], {
    type: "application/msword",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  const today = new Date().toISOString().split("T")[0];
  link.download = `Kumpulan_Berita_Acara_Absensi_${today}.doc`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
