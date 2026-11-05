import React, { useState } from "react";
import { generateExcel } from "../utils/exportExcel";
import {
  generateBeritaAcara,
  generateBeritaAcaraMassal,
} from "../utils/exportDoc";

// Helper tanggal
const parseDate = (str) => {
  const [d, m, y] = str.split("-");
  return new Date(y, m - 1, d);
};

const formatDate = (date) => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};

const extractPdfData = (rawTextData) => {
  const savedData = localStorage.getItem("dataPekerja");
  const pekerjaDB = savedData ? JSON.parse(savedData) : [];
  const uniqueDates = new Set();
  const events = [];
  const dateRegex = /^\d{2}-\d{2}-$/;
  const timeRegex = /^\d{2}:\d{2}$/;

  for (let i = 0; i < rawTextData.length; i++) {
    if (dateRegex.test(rawTextData[i]) && /^\d{4}$/.test(rawTextData[i + 1])) {
      const tanggal = rawTextData[i] + rawTextData[i + 1];
      uniqueDates.add(tanggal);
      const nama = rawTextData[i + 2];

      let jam = [];
      for (let j = 3; j < 10; j++) {
        if (rawTextData[i + j] && dateRegex.test(rawTextData[i + j])) break;
        if (rawTextData[i + j] && timeRegex.test(rawTextData[i + j]))
          jam.push(rawTextData[i + j]);
      }
      events.push({
        tanggal,
        nama,
        jamMasuk: jam[0] || "",
        jamPulang: jam[1] || "",
      });
    }
  }

  // Melengkapi rentang tanggal yang kosong dalam periode
  let datesArray = Array.from(uniqueDates);
  if (datesArray.length > 1) {
    const dateObjects = datesArray.map(parseDate).sort((a, b) => a - b);
    const minDate = dateObjects[0];
    const maxDate = dateObjects[dateObjects.length - 1];
    const completeDates = [];

    let curr = new Date(minDate);
    while (curr <= maxDate) {
      completeDates.push(formatDate(curr));
      curr.setDate(curr.getDate() + 1);
    }
    datesArray = completeDates;
  } else {
    datesArray.sort();
  }

  const rekapObj = {};

  events.forEach((ev) => {
    if (!rekapObj[ev.nama]) {
      rekapObj[ev.nama] = { nama: ev.nama, absen: {}, tglBermasalah: [] };
      datesArray.forEach((d) => {
        rekapObj[ev.nama].absen[d] = { H: 0, L: 0, UM: 0 };
      });
    }

    const pekerjaDBItem = pekerjaDB.find(
      (p) => p.nama.toLowerCase().trim() === ev.nama.toLowerCase().trim(),
    );
    const hakUM = pekerjaDBItem ? pekerjaDBItem.statusUM : false;
    let L = 0;
    let UM = 0;
    let H = 1;

    // Deteksi lupa absen pulang
    if (ev.jamMasuk && !ev.jamPulang) {
      rekapObj[ev.nama].tglBermasalah.push(ev.tanggal);
    }

    if (ev.jamPulang) {
      let [jP, mP] = ev.jamPulang.split(":").map(Number);

      // Toleransi pembulatan lembur menit 55 - 59
      if (mP >= 55 && mP <= 59) {
        jP += 1;
        if (jP === 24) jP = 0;
      }

      let [jM] = (ev.jamMasuk || "00:00").split(":").map(Number);
      let isNextDay = jP < jM;

      if (!isNextDay) {
        if (jP === 17) L = 1;
        else if (jP === 18 || jP === 19) L = 2;
        else if (jP === 20) L = 3;
        else if (jP === 21) L = 4;
        else if (jP === 22) L = 5;
        else if (jP === 23) L = 6;
      } else {
        if (jP === 0 || jP === 1) L = 7;
        else if (jP === 2) L = 8;
        else if (jP === 3) L = 9;
        else if (jP === 4) L = 10;
        else if (jP === 5) L = 11;
        else if (jP >= 6) L = 12;
      }

      if (hakUM) {
        if (L >= 12) UM = 3;
        else if (L >= 7) UM = 2;
        else if (L >= 4) UM = 1;
      }
    }

    rekapObj[ev.nama].absen[ev.tanggal] = { H, L, UM };
  });

  return { tanggalList: datesArray, rekapData: Object.values(rekapObj) };
};

export default function DataGrid({ rawTextData, onReset }) {
  const [initialData] = useState(() => extractPdfData(rawTextData));
  const [tanggalList] = useState(initialData.tanggalList);
  const [rekapData, setRekapData] = useState(initialData.rekapData);

  const [modalBA, setModalBA] = useState({
    isOpen: false,
    nama: "",
    unit: "",
    selectedTgl: [],
  });

  const savedData = localStorage.getItem("dataPekerja");
  const pekerjaDB = savedData ? JSON.parse(savedData) : [];

  const handleInputChange = (nama, tanggal, field, value) => {
    const numVal = Number(value);
    setRekapData((prevData) => {
      const pekerjaDBItem = pekerjaDB.find(
        (p) => p.nama.toLowerCase().trim() === nama.toLowerCase().trim(),
      );
      const hakUM = pekerjaDBItem ? pekerjaDBItem.statusUM : false;

      return prevData.map((pekerja) => {
        if (pekerja.nama === nama) {
          const currentDayData = pekerja.absen[tanggal] || {
            H: 0,
            L: 0,
            UM: 0,
          };
          let newH = currentDayData.H;
          let newL = currentDayData.L;
          let newUM = currentDayData.UM;

          if (field === "H") newH = numVal;
          else if (field === "L") {
            newL = numVal;
            if (hakUM) {
              if (newL >= 12) newUM = 3;
              else if (newL >= 7) newUM = 2;
              else if (newL >= 4) newUM = 1;
              else newUM = 0;
            } else newUM = 0;
          }

          // Otomatis tandai tanggal jika diisi secara manual
          let updatedTglBermasalah = [...pekerja.tglBermasalah];
          if (
            (newH > 0 || newL > 0) &&
            !updatedTglBermasalah.includes(tanggal)
          ) {
            updatedTglBermasalah.push(tanggal);
          }

          return {
            ...pekerja,
            tglBermasalah: updatedTglBermasalah,
            absen: {
              ...pekerja.absen,
              [tanggal]: { H: newH, L: newL, UM: newUM },
            },
          };
        }
        return pekerja;
      });
    });
  };

  const handleBukaModal = (pekerja, dbUnit) => {
    setModalBA({
      isOpen: true,
      nama: pekerja.nama,
      unit: dbUnit,
      selectedTgl: [...pekerja.tglBermasalah],
    });
  };

  const handleCetakBA = () => {
    if (modalBA.selectedTgl.length === 0) {
      alert("Pilih minimal 1 tanggal untuk dibuatkan Berita Acara!");
      return;
    }
    const sortedTgl = [...modalBA.selectedTgl].sort(
      (a, b) => parseDate(a) - parseDate(b),
    );
    generateBeritaAcara(modalBA.nama, modalBA.unit, sortedTgl);
    setModalBA({ ...modalBA, isOpen: false });
  };

  const handleCetakSemuaBA = () => {
    const listBermasalah = rekapData
      .filter((p) => p.tglBermasalah && p.tglBermasalah.length > 0)
      .map((p) => {
        const dbUnit =
          pekerjaDB.find(
            (db) =>
              db.nama.toLowerCase().trim() === p.nama.toLowerCase().trim(),
          )?.unitKerja || "WORKSHOP";
        return {
          nama: p.nama,
          unitKerja: dbUnit,
          tanggalList: [...p.tglBermasalah].sort(
            (a, b) => parseDate(a) - parseDate(b),
          ),
        };
      });

    if (listBermasalah.length === 0) {
      alert("Tidak ada pekerja yang memiliki absensi bermasalah!");
      return;
    }

    const periodeText =
      tanggalList.length > 0
        ? `${tanggalList[0]}_sd_${tanggalList[tanggalList.length - 1]}`
        : "";
    generateBeritaAcaraMassal(listBermasalah, periodeText);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md mb-8 border-t-4 border-green-500 max-w-full overflow-hidden relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Langkah 2: Preview & Edit Rekap Opname
        </h2>
        <div className="space-x-3 mt-4 md:mt-0 flex flex-wrap gap-2">
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm font-medium"
          >
            Batal / Upload Ulang
          </button>
          <button
            onClick={handleCetakSemuaBA}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-bold shadow"
          >
            Cetak Semua BA (1 File)
          </button>
          <button
            onClick={() => generateExcel(tanggalList, rekapData)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-bold shadow"
          >
            Export ke Excel (Selesai)
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <table className="min-w-full divide-y divide-gray-300 border">
          <thead className="bg-gray-100">
            <tr>
              <th
                rowSpan={2}
                className="px-4 py-2 border border-gray-300 font-bold text-gray-700 text-sm sticky left-0 bg-gray-100 z-10 w-48"
              >
                Nama Pekerja
              </th>
              {tanggalList.map((tgl) => (
                <th
                  colSpan={2}
                  key={tgl}
                  className="px-2 py-1 border border-gray-300 text-center text-xs font-bold text-gray-700 whitespace-nowrap"
                >
                  {tgl.substring(0, 5)}
                </th>
              ))}
              <th
                colSpan={3}
                className="px-2 py-1 border border-gray-300 text-center text-sm font-extrabold text-gray-900 bg-yellow-100"
              >
                TOTAL
              </th>
              <th
                rowSpan={2}
                className="px-4 py-2 border border-gray-300 text-center text-sm font-extrabold text-white bg-red-600"
              >
                BERITA ACARA
              </th>
            </tr>
            <tr>
              {tanggalList.map((tgl) => (
                <React.Fragment key={tgl + "sub"}>
                  <th className="px-1 py-1 border border-gray-300 text-center text-xs text-gray-600 font-medium">
                    H
                  </th>
                  <th className="px-1 py-1 border border-gray-300 text-center text-xs text-blue-600 font-medium">
                    L
                  </th>
                </React.Fragment>
              ))}
              <th className="px-2 py-1 border border-gray-300 text-center text-xs font-bold text-gray-900 bg-yellow-100">
                Hari
              </th>
              <th className="px-2 py-1 border border-gray-300 text-center text-xs font-bold text-gray-900 bg-yellow-100">
                Lembur
              </th>
              <th className="px-2 py-1 border border-gray-300 text-center text-xs font-bold text-gray-900 bg-yellow-100">
                UM
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rekapData.map((pekerja, i) => {
              let totalH = 0;
              let totalL = 0;
              let totalUM = 0;
              tanggalList.forEach((tgl) => {
                totalH += pekerja.absen[tgl]?.H || 0;
                totalL += pekerja.absen[tgl]?.L || 0;
                totalUM += pekerja.absen[tgl]?.UM || 0;
              });

              const dbUnit =
                pekerjaDB.find(
                  (p) =>
                    p.nama.toLowerCase().trim() ===
                    pekerja.nama.toLowerCase().trim(),
                )?.unitKerja || "WORKSHOP";

              return (
                <tr key={i} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-2 border border-gray-300 text-sm font-semibold text-gray-900 sticky left-0 bg-white truncate">
                    {pekerja.nama}
                  </td>
                  {tanggalList.map((tgl) => (
                    <React.Fragment key={tgl + "val"}>
                      <td
                        className={`border border-gray-300 p-0 align-middle ${pekerja.tglBermasalah.includes(tgl) ? "bg-red-100" : ""}`}
                      >
                        <input
                          type="number"
                          min="0"
                          max="1"
                          className="w-8 h-8 text-center text-sm font-medium border-0 focus:ring-2 focus:ring-blue-500 bg-transparent m-0 p-0"
                          value={pekerja.absen[tgl]?.H || 0}
                          onChange={(e) =>
                            handleInputChange(
                              pekerja.nama,
                              tgl,
                              "H",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                      <td
                        className={`border border-gray-300 p-0 align-middle ${pekerja.tglBermasalah.includes(tgl) ? "bg-red-100" : "bg-blue-50/30"}`}
                      >
                        <input
                          type="number"
                          min="0"
                          className="w-8 h-8 text-center text-sm font-medium text-blue-700 border-0 focus:ring-2 focus:ring-blue-500 bg-transparent m-0 p-0"
                          value={pekerja.absen[tgl]?.L || 0}
                          onChange={(e) =>
                            handleInputChange(
                              pekerja.nama,
                              tgl,
                              "L",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                    </React.Fragment>
                  ))}
                  <td className="px-2 py-1 border border-gray-300 text-center text-sm font-bold bg-yellow-50">
                    {totalH}
                  </td>
                  <td className="px-2 py-1 border border-gray-300 text-center text-sm font-bold text-blue-700 bg-yellow-50">
                    {totalL}
                  </td>
                  <td className="px-2 py-1 border border-gray-300 text-center text-sm font-bold text-green-700 bg-yellow-50">
                    {totalUM}
                  </td>

                  <td className="px-2 py-1 border border-gray-300 text-center">
                    <button
                      onClick={() => handleBukaModal(pekerja, dbUnit)}
                      className={`text-xs px-2 py-1 rounded font-bold transition-transform transform active:scale-95 ${
                        pekerja.tglBermasalah.length > 0
                          ? "bg-red-500 hover:bg-red-700 text-white shadow"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      Buat DOC
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- MODAL PILIH TANGGAL BERITA ACARA --- */}
      {modalBA.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm border-t-4 border-red-500">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Pilih Tanggal Berita Acara
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Pekerja:{" "}
              <span className="font-bold text-gray-900">{modalBA.nama}</span>
            </p>

            <div className="max-h-56 overflow-y-auto border border-gray-200 p-3 mb-5 rounded-md bg-gray-50">
              {tanggalList.map((tgl) => (
                <label
                  key={tgl}
                  className="flex items-center space-x-3 mb-2 cursor-pointer p-1 hover:bg-gray-100 rounded"
                >
                  <input
                    type="checkbox"
                    checked={modalBA.selectedTgl.includes(tgl)}
                    onChange={() => {
                      const isSelected = modalBA.selectedTgl.includes(tgl);
                      const newSelected = isSelected
                        ? modalBA.selectedTgl.filter((d) => d !== tgl)
                        : [...modalBA.selectedTgl, tgl];
                      setModalBA({ ...modalBA, selectedTgl: newSelected });
                    }}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {tgl}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setModalBA({ ...modalBA, isOpen: false })}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-bold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCetakBA}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-bold shadow transition-colors"
              >
                Cetak DOC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
