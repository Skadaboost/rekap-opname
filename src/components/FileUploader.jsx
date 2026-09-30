import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url"; // <-- Tambahkan baris ini

// Gunakan worker lokal bawaan paket NPM, bukan CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export default function FileUploader({ onDataExtracted }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      const fileReader = new FileReader();

      fileReader.onload = async function () {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;

        let fullTextArray = [];

        // Looping untuk membaca setiap halaman PDF
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();

          // Mengambil teks dan membersihkan spasi kosong
          const pageText = textContent.items
            .map((item) => item.str.trim())
            .filter((str) => str !== "");
          fullTextArray = fullTextArray.concat(pageText);
        }

        // Tampilkan hasil mentah di console browser untuk inspeksi awal
        console.log("Teks mentah PDF:", fullTextArray);

        // Kirim data mentah ke komponen utama
        if (onDataExtracted) onDataExtracted(fullTextArray);
        setIsProcessing(false);
      };

      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      alert("Gagal memproses PDF: " + error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md mb-8 border-t-4 border-blue-600">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Langkah 1: Upload Laporan Presensi (PDF)
      </h2>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileUpload}
        disabled={isProcessing}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100 cursor-pointer"
      />
      {isProcessing && (
        <div className="mt-4 flex items-center text-blue-600 font-medium">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Membongkar data presensi dari PDF...
        </div>
      )}
    </div>
  );
}
