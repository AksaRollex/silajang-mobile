export function formatDate(date: string, mode = "date"): string | undefined {
  if (!date) return "";

  const newDate = new Date(date);
  if (mode === "date") {
    const year = newDate.getFullYear();
    const month = ("0" + (newDate.getMonth() + 1)).slice(-2);
    const day = newDate.getDate();
    return `${year}-${month}-${day}`;
  } else if (mode === "time") {
    const hour = newDate.getHours();
    const minute = newDate.getMinutes();
    const second = newDate.getSeconds();
    return `${hour < 10 ? `0${hour}` : hour}:${
      minute < 10 ? `0${minute}` : minute
    }:${second < 10 ? `0${second}` : second}`;
  }
}

export function rupiah(value: number | string) {
  if (!value) return 0;

  if (typeof value === "string") {
    value = parseInt(value);
  }

  return Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function genOtp(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

export function formatIndoDate(date: any, time = false): string {
  if (!date) return "";

  var months = [
    "",
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  //   export function mapStatusPengujian(status) {
  //     const statusPengujian = {
  //         "-1": "Revisi",
  //         0: "Mengajukan Permohonan",
  //         1: "Menyerahkan Sampel",
  //         2: "Menyerahkan Surat Perintah Pengujian",
  //         3: "Menyerahkan sampel untuk Proses Pengujian",
  //         4: "Menyerahkan RDPS",
  //         5: "Menyerahkan RDPS untuk Pengetikan LHU",
  //         6: "Menyerahkan LHU untuk Diverifikasi",
  //         7: "Mengesahkan LHU",
  //         8: "Pembayaran",
  //         9: "Penyerahan LHU",
  //         10: "Penyerahan LHU Amandemen (Jika ada)",
  //         11: "Selesai"
  //     };

  //     return statusPengujian[status] || "Sedang Diproses";
  // }

  // export function mapStatusPembayaran(status) {
  //   const statusPembayaran = {
  //       0: "Belum Dibayar",
  //       1: "Berhasil",
  //       2: "Gagal",
  //   };

  //   return statusPembayaran[status] || "Belum Dibayar";
  // }
  var d = date.split(" ");
  var date = d[0].split("-");
  var day = date[2];
  var month = parseInt(date[1]);
  var year = date[0];
  if (time) {
    return day + " " + months[month] + " " + year + " " + d[1];
  } else {
    return day + " " + months[month] + " " + year;
  }
}
