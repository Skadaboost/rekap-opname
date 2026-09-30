import { useState } from "react";
import FileUploader from "./components/FileUploader";
import MasterPekerja from "./components/MasterPekerja";
import DataGrid from "./components/DataGrid";

function App() {
  const [rawPdfData, setRawPdfData] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <header className="max-w-[95%] xl:max-w-7xl mx-auto px-6 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Sistem Rekap Opname
        </h1>
        <p className="text-gray-600 mt-2 font-medium">
          Konversi PDF Presensi ke format Excel secara otomatis.
        </p>
      </header>

      <main className="max-w-[95%] xl:max-w-7xl mx-auto px-2 md:px-6">
        {/* Jika belum ada data PDF, tampilkan uploader. Jika ada, tampilkan tabel */}
        {!rawPdfData ? (
          <FileUploader onDataExtracted={(data) => setRawPdfData(data)} />
        ) : (
          <DataGrid
            rawTextData={rawPdfData}
            onReset={() => setRawPdfData(null)}
          />
        )}

        <MasterPekerja />
      </main>
    </div>
  );
}

export default App;
