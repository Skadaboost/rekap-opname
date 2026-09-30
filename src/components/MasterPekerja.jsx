import { useState, useRef } from "react";
import { saveAs } from "file-saver";

export default function MasterPekerja() {
  const [pekerjaList, setPekerjaList] = useState(() => {
    const savedData = localStorage.getItem("dataPekerja");
    return savedData ? JSON.parse(savedData) : [];
  });

  const [formData, setFormData] = useState({
    nama: "",
    unitKerja: "WORKSHOP",
    upahHarian: "",
    upahLembur: "",
    statusUM: false,
    bank: "",
    rekening: "",
    atasNama: "",
  });

  const [editingId, setEditingId] = useState(null);

  // Referensi untuk input file tersembunyi (digunakan saat Import)
  const fileInputRef = useRef(null);

  const handleSimpan = (e) => {
    e.preventDefault();
    let newData;

    if (editingId !== null) {
      newData = pekerjaList.map((p) =>
        p.id === editingId ? { ...formData, id: editingId } : p,
      );
      setEditingId(null);
    } else {
      newData = [...pekerjaList, { ...formData, id: Date.now() }];
    }

    setPekerjaList(newData);
    localStorage.setItem("dataPekerja", JSON.stringify(newData));

    setFormData({
      nama: "",
      unitKerja: "WORKSHOP",
      upahHarian: "",
      upahLembur: "",
      statusUM: false,
      bank: "",
      rekening: "",
      atasNama: "",
    });
  };

  const handleEdit = (pekerja) => {
    setEditingId(pekerja.id);
    setFormData({
      nama: pekerja.nama || "",
      unitKerja: pekerja.unitKerja || "WORKSHOP",
      upahHarian: pekerja.upahHarian || "",
      upahLembur: pekerja.upahLembur || "",
      statusUM: pekerja.statusUM || false,
      bank: pekerja.bank || "",
      rekening: pekerja.rekening || "",
      atasNama: pekerja.atasNama || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBatalEdit = () => {
    setEditingId(null);
    setFormData({
      nama: "",
      unitKerja: "WORKSHOP",
      upahHarian: "",
      upahLembur: "",
      statusUM: false,
      bank: "",
      rekening: "",
      atasNama: "",
    });
  };

  const handleHapus = (id) => {
    if (window.confirm("Yakin ingin menghapus pekerja ini?")) {
      const filteredData = pekerjaList.filter((p) => p.id !== id);
      setPekerjaList(filteredData);
      localStorage.setItem("dataPekerja", JSON.stringify(filteredData));
      if (editingId === id) {
        handleBatalEdit();
      }
    }
  };

  // --- FUNGSI EXPORT (BACKUP) ---
  const handleExportBackup = () => {
    if (pekerjaList.length === 0) {
      alert("Tidak ada data pekerja untuk diexport!");
      return;
    }
    const dataString = JSON.stringify(pekerjaList, null, 2);
    const blob = new Blob([dataString], { type: "application/json" });

    // Mendapatkan tanggal hari ini untuk nama file
    const today = new Date().toISOString().split("T")[0];
    saveAs(blob, `Backup_Master_Pekerja_${today}.json`);
  };

  // --- FUNGSI IMPORT (RESTORE) ---
  const handleImportBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (Array.isArray(importedData)) {
          setPekerjaList(importedData);
          localStorage.setItem("dataPekerja", JSON.stringify(importedData));
          alert("Data Master Pekerja berhasil dipulihkan (Restore)!");
        } else {
          alert(
            "Format file tidak valid. Pastikan Anda mengunggah file Backup (.json) yang benar.",
          );
        }
      } catch (error) {
        alert("Gagal membaca file. Pastikan file tidak rusak.");
      }
    };
    reader.readAsText(file);
    // Reset nilai input agar bisa mengunggah file yang sama lagi jika diperlukan
    event.target.value = null;
  };

  const sortedPekerjaList = [...pekerjaList].sort((a, b) => {
    const unitA = (a.unitKerja || "").toLowerCase();
    const unitB = (b.unitKerja || "").toLowerCase();
    if (unitA < unitB) return -1;
    if (unitA > unitB) return 1;

    const namaA = (a.nama || "").toLowerCase();
    const namaB = (b.nama || "").toLowerCase();
    return namaA.localeCompare(namaB);
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Master Data Pekerja
        </h2>

        {/* TOMBOL EXPORT DAN IMPORT */}
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleExportBackup}
            className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 text-sm font-bold shadow transition-colors"
          >
            Export Data (Backup)
          </button>

          <button
            onClick={() => fileInputRef.current.click()}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm font-bold shadow transition-colors"
          >
            Import Data (Restore)
          </button>

          {/* Input file tersembunyi yang dipicu oleh tombol Import */}
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImportBackup}
            className="hidden"
          />
        </div>
      </div>

      {/* Form Input / Edit Pekerja */}
      <form
        onSubmit={handleSimpan}
        className="bg-white p-6 rounded-lg shadow-md mb-8 grid grid-cols-2 gap-4 border-t-4 border-blue-600"
      >
        <div className="col-span-2 flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-700">
            {editingId !== null ? "Edit Data Pekerja" : "Tambah Pekerja Baru"}
          </h3>
          {editingId !== null && (
            <button
              type="button"
              onClick={handleBatalEdit}
              className="text-sm text-red-600 hover:underline"
            >
              Batal Edit
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nama Pekerja
          </label>
          <input
            type="text"
            required
            className="mt-1 p-2 w-full border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Unit Kerja
          </label>
          <input
            type="text"
            className="mt-1 p-2 w-full border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.unitKerja}
            onChange={(e) =>
              setFormData({ ...formData, unitKerja: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Upah Harian (Rp)
          </label>
          <input
            type="number"
            required
            className="mt-1 p-2 w-full border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.upahHarian}
            onChange={(e) =>
              setFormData({ ...formData, upahHarian: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Upah Lembur (Rp/Jam)
          </label>
          <input
            type="number"
            required
            className="mt-1 p-2 w-full border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.upahLembur}
            onChange={(e) =>
              setFormData({ ...formData, upahLembur: e.target.value })
            }
          />
        </div>
        <div className="col-span-2 flex items-center mt-2">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 rounded"
            checked={formData.statusUM}
            onChange={(e) =>
              setFormData({ ...formData, statusUM: e.target.checked })
            }
          />
          <label className="ml-2 block text-sm font-medium text-gray-700">
            Pekerja ini berhak mendapat Uang Makan (UM)
          </label>
        </div>
        <div className="col-span-2 border-t pt-4 mt-2 grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nama Bank
            </label>
            <input
              type="text"
              className="mt-1 p-2 w-full border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.bank}
              onChange={(e) =>
                setFormData({ ...formData, bank: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              No. Rekening
            </label>
            <input
              type="text"
              className="mt-1 p-2 w-full border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.rekening}
              onChange={(e) =>
                setFormData({ ...formData, rekening: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Atas Nama
            </label>
            <input
              type="text"
              className="mt-1 p-2 w-full border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.atasNama}
              onChange={(e) =>
                setFormData({ ...formData, atasNama: e.target.value })
              }
            />
          </div>
        </div>

        <div className="col-span-2 flex space-x-3 mt-4">
          <button
            type="submit"
            className={`flex-1 py-2 px-4 rounded text-white font-bold shadow transition-colors ${editingId !== null ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {editingId !== null
              ? "Perbarui Data Pekerja"
              : "Simpan Data Pekerja Baru"}
          </button>
          {editingId !== null && (
            <button
              type="button"
              onClick={handleBatalEdit}
              className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 font-medium transition-colors"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* Tabel Data Pekerja */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Unit Kerja / Nama
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Upah / Lembur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Hak UM
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Rekening
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPekerjaList.map((pekerja) => (
              <tr key={pekerja.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="font-bold text-blue-600">
                    {pekerja.unitKerja}
                  </span>
                  <br />
                  <span className="font-medium">{pekerja.nama}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  Rp {Number(pekerja.upahHarian || 0).toLocaleString("id-ID")}{" "}
                  <br />
                  <span className="text-xs text-gray-500">
                    Rp {Number(pekerja.upahLembur || 0).toLocaleString("id-ID")}
                    /jam
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pekerja.statusUM ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {pekerja.statusUM ? "Ya" : "Tidak"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {pekerja.bank ? `${pekerja.bank} - ${pekerja.rekening}` : "-"}
                  <br />
                  <span className="text-xs text-gray-400">
                    {pekerja.atasNama ? `a/n ${pekerja.atasNama}` : ""}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center space-x-3">
                  <button
                    onClick={() => handleEdit(pekerja)}
                    className="text-indigo-600 hover:text-indigo-900 font-semibold text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleHapus(pekerja.id)}
                    className="text-red-600 hover:text-red-900 font-semibold text-sm"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {sortedPekerjaList.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Belum ada data pekerja. Silakan tambahkan melalui form di atas
                  atau lakukan Import Data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
