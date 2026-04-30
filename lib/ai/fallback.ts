import type { DiagnosisInput, DiagnosisResult, SessionSummary, StoredSession } from "@/types/diagnosis";

type DiagnosisShape = Pick<DiagnosisInput, "language" | "issueType" | "symptoms" | "attemptedFixes">;
type ScenarioKey = "inventory-sync" | "scanner-path" | "printer-path" | "network-path" | "pos-flow" | "generic";

type ScenarioProfile = {
  key: ScenarioKey;
  mission: string;
  severity: DiagnosisResult["severity"];
  confidence: number;
  summary: string;
  probableCauses: string[];
  nextAction: string;
  escalationNeeded: boolean;
  recommendedProducts: string[];
  recommendedServiceAction: string | null;
  headline: string;
  recommendedHandoff: string;
};

type TextSignals = {
  text: string;
  urgent: boolean;
  storeBlocked: boolean;
  fieldInput: boolean;
  bluetooth: boolean;
  paper: boolean;
  selfTest: boolean;
  stock: boolean;
  minus: boolean;
  sync: boolean;
  offline: boolean;
  wifi: boolean;
  lan: boolean;
  loading: boolean;
};

function hasAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function detectSignals(input: DiagnosisShape): TextSignals {
  const text = `${input.symptoms} ${input.attemptedFixes}`.toLowerCase();

  return {
    text,
    urgent: hasAny(text, [
      "urgent",
      "down",
      "stuck",
      "cannot",
      "can't",
      "failed",
      "not working",
      "offline",
      "error",
      "gagal",
      "tidak bisa",
      "tidak jalan",
      "putus",
      "berhenti",
    ]),
    storeBlocked: hasAny(text, [
      "cannot sell",
      "can't sell",
      "no transaction",
      "all cashier",
      "all terminal",
      "store down",
      "tidak bisa transaksi",
      "semua kasir",
      "semua terminal",
      "toko berhenti",
      "tidak bisa jual",
    ]),
    fieldInput: hasAny(text, [
      "tidak masuk ke kolom",
      "tidak masuk kolom",
      "tidak masuk field",
      "kolom item",
      "field item",
      "text field",
      "cursor",
      "textbox",
      "input field",
      "barcode tidak muncul",
      "scan tidak muncul",
    ]),
    bluetooth: hasAny(text, ["bluetooth", "bt", "pairing", "paired"]),
    paper: hasAny(text, [
      "paper",
      "kertas",
      "jam",
      "cover",
      "tutup",
      "feed",
      "out of paper",
      "paper out",
    ]),
    selfTest: hasAny(text, ["self-test", "test page", "tes print", "tes cetak"]),
    stock: hasAny(text, ["stock", "stok", "inventory", "inventori", "sku"]),
    minus: hasAny(text, ["minus", "negative stock", "selisih", "tidak cocok"]),
    sync: hasAny(text, ["sync", "sinkron", "queue", "pending upload", "pending sync", "backoffice"]),
    offline: hasAny(text, ["offline", "internet", "network", "wifi", "wi-fi", "router", "server", "timeout"]),
    wifi: hasAny(text, ["wifi", "wi-fi", "ssid"]),
    lan: hasAny(text, ["lan", "ethernet", "ip address", "ip printer"]),
    loading: hasAny(text, ["loading", "hang", "freeze", "crash", "lemot", "macet", "blank screen"]),
  };
}

function buildProfile(input: DiagnosisShape): ScenarioProfile {
  const id = input.language === "id";
  const signals = detectSignals(input);
  const inventoryLike =
    input.issueType === "inventory-sync" ||
    ((input.issueType === "pos" || input.issueType === "other") && (signals.stock || signals.sync));
  const scannerLike = input.issueType === "scanner" || (input.issueType === "other" && hasAny(signals.text, ["scanner", "scan", "barcode"]));
  const printerLike =
    input.issueType === "receipt-printer" ||
    (input.issueType === "other" && hasAny(signals.text, ["printer", "print", "cetak", "struk", "thermal"]));
  const networkLike = input.issueType === "network" || (input.issueType === "other" && signals.offline);

  if (inventoryLike) {
    const summary = signals.minus
      ? id
        ? "Keluhannya lebih dekat ke selisih stok di POS: angka lokal terlihat minus atau tidak cocok dengan sumber inventori."
        : "The symptom points to a stock mismatch inside the POS: the local quantity looks negative or diverges from the source inventory."
      : signals.sync
        ? id
          ? "Keluhannya mengarah ke sinkronisasi stok yang tidak tuntas antara POS, cache lokal, dan sumber inventori."
          : "The symptom points to incomplete stock synchronization between the POS, local cache, and the source inventory."
        : id
          ? "Masalah ini terlihat berada di jalur data inventori POS, bukan di perangkat input tunggal."
          : "This issue appears to sit in the POS inventory data path rather than in a single input device.";

    return {
      key: "inventory-sync",
      mission: id
        ? "Lacak titik beda antara stok POS, queue transaksi, dan sumber inventori."
        : "Trace where stock truth diverges between the POS, the transaction queue, and the inventory source.",
      severity: signals.storeBlocked || signals.minus ? "high" : "medium",
      confidence: 0.83,
      summary,
      probableCauses: [
        id
          ? "Antrian transaksi offline belum terkirim penuh ke server sehingga stok lokal tertinggal."
          : "An offline transaction queue has not fully uploaded, leaving the local stock behind.",
        id
          ? "Cache stok di perangkat kasir belum refresh setelah penyesuaian, retur, atau sinkron terakhir."
          : "The cashier device still holds stale stock after an adjustment, return, or recent sync.",
        id
          ? "Ada perubahan stok di backoffice yang belum turun ke terminal yang sedang dipakai."
          : "A back-office stock update has not propagated to the terminal currently in use.",
      ],
      nextAction: id
        ? "Ambil satu SKU contoh yang minus, bandingkan angka di POS versus backoffice, lalu cek waktu sinkron terakhir atau queue transaksi yang masih pending."
        : "Pick one negative SKU, compare the POS quantity against the back-office value, then inspect the last sync time or any pending transaction queue.",
      escalationNeeded: signals.storeBlocked,
      recommendedProducts: [],
      recommendedServiceAction: signals.storeBlocked
        ? id
          ? "Siapkan handoff ke support POS atau backoffice dengan SKU contoh, waktu sinkron terakhir, dan status queue transaksi."
          : "Prepare a handoff to POS or back-office support with one sample SKU, the last sync time, and the transaction queue status."
        : null,
      headline: id ? "Tinjau jalur sinkronisasi stok" : "Review the stock sync path",
      recommendedHandoff: id
        ? "Tim support POS atau inventori perlu memeriksa SKU contoh, queue transaksi, dan perubahan stok terakhir di backoffice."
        : "A POS or inventory support specialist should inspect the sample SKU, the transaction queue, and the latest back-office stock change.",
    };
  }

  if (scannerLike) {
    const summary = signals.fieldInput
      ? id
        ? "Masalahnya terlihat di jalur input scanner ke kolom POS: barcode dipindai, tetapi nilainya tidak masuk ke field kasir."
        : "The problem appears in the scanner-to-POS input path: the barcode is scanned, but the value does not land in the cashier field."
      : signals.bluetooth
        ? id
          ? "Scanner tampak bermasalah di jalur pairing atau mode bangun-tidur Bluetooth, sehingga hasil scan tidak konsisten masuk ke POS."
          : "The scanner looks unstable in its pairing or Bluetooth wake path, so scanned values are not entering the POS consistently."
        : id
          ? "Keluhannya mengarah ke putusnya jalur input barcode dari scanner ke aplikasi POS."
          : "The symptom points to a broken barcode input path between the scanner and the POS app.";

    return {
      key: "scanner-path",
      mission: id
        ? "Isolasi apakah hambatan ada di mode scanner, fokus kolom, atau jalur koneksinya."
        : "Isolate whether the break sits in scanner mode, field focus, or the connection path.",
      severity: signals.storeBlocked || signals.urgent ? "high" : "medium",
      confidence: 0.82,
      summary,
      probableCauses: [
        id
          ? "Scanner tidak berada di mode keyboard atau HID yang dibutuhkan aplikasi kasir."
          : "The scanner is not in the keyboard or HID mode expected by the cashier app.",
        id
          ? "Fokus input ada di elemen lain, sehingga hasil scan tidak masuk ke field item aktif."
          : "Input focus is sitting on another element, so the scan never lands in the active item field.",
        id
          ? "Pairing Bluetooth, suffix Enter, atau koneksi USB tidak stabil saat scan dikirim."
          : "Bluetooth pairing, the Enter suffix, or the USB connection is unstable when the scan is sent.",
      ],
      nextAction: signals.fieldInput
        ? id
          ? "Tes satu barcode di kolom teks biasa atau Notes. Jika karakter muncul di sana tapi tidak di POS, fokuskan pemeriksaan ke field item, shortcut capture, atau suffix Enter."
          : "Test one barcode in a plain text field or Notes. If the characters appear there but not in the POS, focus on the item field, capture shortcut, or Enter suffix."
        : id
          ? "Konfirmasi mode scanner dan ulangi scan di kolom teks sederhana untuk membedakan masalah perangkat dari masalah aplikasi POS."
          : "Confirm the scanner mode and retry one scan in a simple text field to separate device behavior from POS behavior.",
      escalationNeeded: signals.storeBlocked,
      recommendedProducts: signals.bluetooth
        ? [id ? "Scanner USB cadangan" : "Backup USB scanner"]
        : [],
      recommendedServiceAction: signals.storeBlocked
        ? id
          ? "Siapkan handoff ke support device atau POS dengan hasil uji scan di kolom teks biasa versus field kasir."
          : "Prepare a handoff to device or POS support with the scan test result from a plain text field versus the cashier field."
        : null,
      headline: id ? "Tinjau jalur input scanner" : "Review the scanner input path",
      recommendedHandoff: id
        ? "Support device atau POS perlu melihat apakah scan gagal di level perangkat atau hanya di field kasir."
        : "Device or POS support should verify whether the scan fails at the device layer or only inside the cashier field.",
    };
  }

  if (printerLike) {
    const summary = signals.paper
      ? id
        ? "Gejalanya terlihat seperti jalur cetak tertahan di printer itu sendiri, biasanya karena kertas, cover, atau sensor feed."
        : "The symptom looks like the print path is blocked inside the printer itself, usually by paper, the cover latch, or the feed sensor."
      : signals.bluetooth || signals.lan
        ? id
          ? "Masalahnya lebih dekat ke jalur output POS ke printer, terutama pairing, IP printer, atau target printer yang aktif."
          : "The problem sits closer to the POS-to-printer output path, especially pairing, printer IP, or the active target printer."
        : id
          ? "Keluhannya mengarah ke gagalnya keluaran struk dari POS ke printer thermal."
          : "The symptom points to a receipt output failure between the POS and the thermal printer.";

    return {
      key: "printer-path",
      mission: id
        ? "Pisahkan dulu apakah kegagalan ada di printer fisik atau di target output dari POS."
        : "Separate physical printer failure from POS output routing before escalating.",
      severity: signals.storeBlocked || signals.urgent ? "high" : "medium",
      confidence: 0.81,
      summary,
      probableCauses: [
        id
          ? "POS mengarah ke target printer yang salah atau printer default belum sesuai."
          : "The POS is pointing at the wrong printer target or the default printer is incorrect.",
        id
          ? "Kertas, cover, atau sensor printer menahan proses cetak sebelum job diproses."
          : "Paper, the cover latch, or a printer sensor is blocking the print job before it runs.",
        id
          ? "Pairing Bluetooth, kabel USB, atau IP printer berubah dari yang diharapkan terminal."
          : "Bluetooth pairing, the USB cable, or the printer IP has drifted from what the terminal expects.",
      ],
      nextAction: id
        ? "Cetak self-test atau test page langsung dari printer. Jika lolos, lanjut cek printer default, tipe koneksi, dan target output di POS."
        : "Run a self-test or test page directly from the printer. If that succeeds, review the default printer, connection type, and POS output target.",
      escalationNeeded: signals.storeBlocked,
      recommendedProducts: signals.paper ? [id ? "Roll thermal cadangan" : "Backup thermal roll"] : [],
      recommendedServiceAction: signals.storeBlocked
        ? id
          ? "Siapkan handoff ke support printer dengan hasil self-test, jenis koneksi, dan status printer default di POS."
          : "Prepare a handoff to printer support with the self-test result, connection type, and default-printer status in the POS."
        : null,
      headline: id ? "Tinjau jalur cetak printer" : "Review the printer output path",
      recommendedHandoff: id
        ? "Support printer atau POS perlu memeriksa apakah problem ada di hardware printer atau hanya di routing output aplikasi."
        : "Printer or POS support should verify whether the fault is inside the printer hardware or only in the app's output routing.",
    };
  }

  if (networkLike) {
    return {
      key: "network-path",
      mission: id
        ? "Lacak apakah putusnya ada di endpoint perangkat, jaringan toko, atau akses keluar ke layanan pusat."
        : "Trace whether the break is at the device endpoint, the store network, or the upstream service path.",
      severity: signals.storeBlocked || signals.offline ? "high" : "medium",
      confidence: 0.8,
      summary: signals.wifi || signals.lan
        ? id
          ? "Masalah ini lebih mirip putusnya jalur koneksi perangkat ke jaringan toko, sehingga sinkronisasi dan layanan POS ikut terdampak."
          : "This looks more like a broken path between the device and the store network, which then disrupts sync and POS services."
        : id
          ? "Keluhannya mengarah ke kegagalan konektivitas, bukan murni kerusakan perangkat tunggal."
          : "The symptom points to a connectivity failure rather than a pure single-device fault.",
      probableCauses: [
        id
          ? "Perangkat pindah SSID, VLAN, atau jalur LAN yang berbeda dari konfigurasi normal."
          : "The device drifted to a different SSID, VLAN, or LAN path than normal.",
        id
          ? "Internet upstream atau gateway toko tidak stabil meskipun perangkat masih tampak tersambung."
          : "The upstream internet or store gateway is unstable even though the device still looks connected.",
        id
          ? "Ada timeout DNS, captive portal, atau lease jaringan yang belum diperbarui."
          : "A DNS timeout, captive portal, or stale network lease is interrupting the route.",
      ],
      nextAction: id
        ? "Bandingkan satu perangkat lain di jaringan yang sama. Jika perangkat lain normal, reconnect endpoint bermasalah dulu sebelum restart router."
        : "Compare one other device on the same network. If the other device is healthy, reconnect the affected endpoint before touching the router.",
      escalationNeeded: signals.storeBlocked,
      recommendedProducts: [],
      recommendedServiceAction: signals.storeBlocked
        ? id
          ? "Siapkan handoff ke support jaringan dengan SSID atau VLAN yang dipakai, perangkat yang terdampak, dan hasil pembanding dari device lain."
          : "Prepare a handoff to network support with the active SSID or VLAN, the affected endpoint, and the comparison result from another device."
        : null,
      headline: id ? "Tinjau jalur konektivitas" : "Review the connectivity path",
      recommendedHandoff: id
        ? "Support jaringan perlu memastikan apakah gangguan ada di endpoint, access point, atau jalur keluar internet toko."
        : "Network support should confirm whether the fault sits at the endpoint, the access point, or the store's upstream internet path.",
    };
  }

  if (input.issueType === "pos") {
    return {
      key: "pos-flow",
      mission: id
        ? "Uji workflow POS secara sempit sampai langkah terakhir yang masih normal terlihat jelas."
        : "Narrow the POS workflow until the last healthy step is obvious.",
      severity: signals.storeBlocked || signals.loading ? "high" : "medium",
      confidence: 0.78,
      summary: signals.loading
        ? id
          ? "Masalahnya lebih mengarah ke state aplikasi POS atau data lokal yang macet, terutama jika berhenti di langkah yang sama berulang."
          : "The issue points more toward a stuck POS app state or local data problem, especially if it freezes on the same step repeatedly."
        : id
          ? "Keluhannya terlihat berada di workflow aplikasi POS, bukan semata pada perangkat input."
          : "The symptom appears to sit inside the POS workflow rather than in a single input device.",
      probableCauses: [
        id
          ? "Session kasir, cache lokal, atau data transaksi sebelumnya menahan workflow berikutnya."
          : "A cashier session, local cache, or a prior transaction state is blocking the next workflow.",
        id
          ? "Ada perubahan konfigurasi atau update aplikasi yang belum sinkron penuh di perangkat ini."
          : "A configuration change or app update is not fully aligned on this device.",
        id
          ? "Aksi yang gagal membutuhkan data referensi yang belum termuat lengkap di terminal."
          : "The failing action depends on reference data that is not fully loaded on the terminal.",
      ],
      nextAction: id
        ? "Ulangi satu transaksi kecil dengan satu SKU, lalu catat langkah terakhir yang masih berhasil untuk memisahkan masalah data, session, atau device."
        : "Repeat one small transaction with one SKU, then record the last step that still succeeds to separate a data, session, or device issue.",
      escalationNeeded: signals.storeBlocked,
      recommendedProducts: [],
      recommendedServiceAction: signals.storeBlocked
        ? id
          ? "Siapkan handoff ke support POS dengan langkah terakhir yang berhasil, versi app, dan perangkat yang terdampak."
          : "Prepare a handoff to POS support with the last successful step, the app version, and the affected device."
        : null,
      headline: id ? "Tinjau workflow aplikasi POS" : "Review the POS workflow",
      recommendedHandoff: id
        ? "Support POS perlu melihat langkah terakhir yang berhasil, versi aplikasi, dan apakah issue muncul di semua kasir atau hanya satu device."
        : "POS support should inspect the last successful step, the app version, and whether the issue appears on every cashier or only one device.",
    };
  }

  return {
    key: "generic",
    mission: id
      ? "Sempitkan masalah ke satu perangkat, satu aksi, dan satu perubahan terakhir."
      : "Reduce the issue to one device, one action, and one recent change.",
    severity: signals.storeBlocked ? "high" : "medium",
    confidence: 0.68,
    summary: id
      ? "Gejala yang dicatat masih cukup umum, jadi langkah terbaik adalah membatasi masalah ke satu alur kecil sebelum menarik kesimpulan."
      : "The captured symptom is still broad, so the best move is to isolate one narrow workflow before drawing a conclusion.",
    probableCauses: [
      id
        ? "Ada perubahan konfigurasi, koneksi, atau perangkat yang belum terlihat jelas dari deskripsi awal."
        : "A configuration, connection, or device change is not yet visible from the initial description.",
      id
        ? "Gejalanya mencampur beberapa kemungkinan penyebab sehingga perlu dipisah lewat tes yang lebih kecil."
        : "The symptom currently blends multiple possible causes and needs a smaller test to separate them.",
    ],
    nextAction: id
      ? "Tuliskan aksi yang tepat saat error muncul, lalu ulangi pada satu perangkat dan satu skenario yang paling sederhana."
      : "Write down the exact action that triggers the error, then repeat it on one device in the simplest possible scenario.",
    escalationNeeded: signals.storeBlocked,
    recommendedProducts: [],
    recommendedServiceAction: signals.storeBlocked
      ? id
        ? "Siapkan handoff dengan gejala persis, waktu kejadian, dan satu langkah tes yang berhasil direproduksi."
        : "Prepare a handoff with the exact symptom, the failure time, and one reproducible test step."
      : null,
    headline: id ? "Ringkas gejala sebelum eskalasi" : "Narrow the symptom before escalation",
    recommendedHandoff: id
      ? "Tim support frontliner perlu melihat gejala yang lebih sempit dulu sebelum meneruskan ke spesialis."
      : "Frontline support should first narrow the symptom before routing it to a specialist.",
  };
}

function buildSteps(profile: ScenarioProfile, language: DiagnosisInput["language"], signals: TextSignals) {
  const id = language === "id";

  switch (profile.key) {
    case "inventory-sync":
      return [
        {
          id: "step-1",
          title: id ? "Bandingkan satu SKU contoh" : "Compare one sample SKU",
          instruction: id
            ? "Pilih satu item yang bermasalah lalu cocokkan stok di POS, backoffice, dan jika ada, laporan transaksi terakhir."
            : "Pick one affected item and compare its stock in the POS, the back office, and the latest transaction record if available.",
          expectedResult: id
            ? "Titik beda stok mulai terlihat di salah satu sumber."
            : "The point where the stock diverges becomes visible in one source.",
          whyItMatters: id
            ? "Satu SKU cukup untuk membedakan masalah data pusat dari cache lokal terminal."
            : "One SKU is enough to separate a central-data issue from a local terminal cache issue.",
        },
        {
          id: "step-2",
          title: id ? "Cek waktu sinkron dan queue" : "Check sync time and queue",
          instruction: id
            ? "Lihat apakah ada transaksi pending, offline queue, atau waktu sinkron terakhir yang tertinggal."
            : "Check for pending transactions, an offline queue, or a stale last-sync timestamp.",
          expectedResult: id
            ? "Terlihat apakah data tertahan di antrian sinkronisasi."
            : "You can tell whether the data is stuck in the sync queue.",
          whyItMatters: id
            ? "Stok minus sering bukan data rusak, tetapi data yang belum lengkap terkirim."
            : "Negative stock often means incomplete delivery of data, not corrupted inventory.",
        },
        {
          id: "step-3",
          title: id ? "Refresh terminal kasir" : "Refresh the cashier terminal",
          instruction: id
            ? "Setelah ada pembanding, muat ulang data item atau login ulang kasir untuk menarik data paling baru."
            : "After you have a comparison point, refresh the item data or re-sign the cashier terminal to pull the latest state.",
          expectedResult: id
            ? "Angka stok terminal menyesuaikan atau tetap salah dengan pola yang lebih jelas."
            : "The terminal stock either corrects itself or stays wrong in a clearer pattern.",
          whyItMatters: id
            ? "Ini memisahkan cache lama dari mismatch yang memang berasal dari pusat."
            : "This separates stale cache from a mismatch that truly originates upstream.",
        },
      ];
    case "scanner-path":
      return [
        {
          id: "step-1",
          title: signals.fieldInput ? (id ? "Pastikan fokus ada di kolom item" : "Confirm focus is on the item field") : id ? "Cek mode scanner" : "Check scanner mode",
          instruction: signals.fieldInput
            ? id
              ? "Klik kolom item aktif lalu scan satu barcode tanpa menyentuh tombol lain."
              : "Click the active item field and scan one barcode without touching any other control."
            : id
              ? "Pastikan scanner memakai mode keyboard atau HID yang memang dibaca aplikasi POS."
              : "Confirm the scanner is using a keyboard or HID mode that the POS app actually reads.",
          expectedResult: id
            ? "Barcode muncul tepat di lokasi input yang diharapkan."
            : "The barcode appears in the expected input location.",
          whyItMatters: id
            ? "Scan yang terbaca tapi masuk ke elemen salah akan tampak seperti scanner mati."
            : "A scan that lands in the wrong element often looks like a dead scanner.",
        },
        {
          id: "step-2",
          title: id ? "Tes di kolom teks biasa" : "Test a plain text field",
          instruction: id
            ? "Buka Notes atau kolom teks sederhana lalu scan barcode yang sama."
            : "Open Notes or another plain text field and scan the same barcode.",
          expectedResult: id
            ? "Karakter barcode muncul seperti input keyboard."
            : "The barcode characters appear like keyboard input.",
          whyItMatters: id
            ? "Jika tes ini lolos, kerusakan ada di workflow POS, bukan di pembacaan scanner."
            : "If this test passes, the fault sits in the POS workflow, not in the scanner read itself.",
        },
        {
          id: "step-3",
          title: signals.bluetooth ? (id ? "Pair ulang scanner Bluetooth" : "Re-pair the Bluetooth scanner") : id ? "Pasang ulang koneksi scanner" : "Re-seat the scanner connection",
          instruction: signals.bluetooth
            ? id
              ? "Hapus pairing lama, pair ulang, lalu tes dengan barcode yang pasti valid."
              : "Forget the old pairing, pair the scanner again, and retry with a known-good barcode."
            : id
              ? "Hubungkan ulang kabel atau port scanner lalu ulangi satu scan yang sama."
              : "Reconnect the scanner cable or port and retry the same scan once.",
          expectedResult: id
            ? "Scanner kembali mengirim input dengan stabil."
            : "The scanner sends input reliably again.",
          whyItMatters: id
            ? "Gangguan pairing atau kontak fisik sering membuat masalah terasa acak."
            : "Pairing drift or weak physical contact often makes the failure look random.",
        },
      ];
    case "printer-path":
      return [
        {
          id: "step-1",
          title: signals.paper ? (id ? "Periksa kertas dan cover" : "Check paper and cover") : id ? "Verifikasi target printer" : "Verify the printer target",
          instruction: signals.paper
            ? id
              ? "Pastikan roll kertas, arah feed, dan cover printer dalam posisi benar."
              : "Confirm the paper roll, feed direction, and cover latch are all correct."
            : id
              ? "Cek printer default dan pastikan terminal menunjuk ke printer yang memang aktif."
              : "Check the default printer and confirm the terminal points to the printer that is actually active.",
          expectedResult: id ? "Status printer terlihat siap." : "The printer shows a ready status.",
          whyItMatters: id
            ? "Printer sehat tetap tidak mencetak jika target salah atau sensor dasarnya tertahan."
            : "A healthy printer still fails if the target is wrong or a basic sensor is blocked.",
        },
        {
          id: "step-2",
          title: signals.selfTest ? (id ? "Ulangi test page yang sama" : "Repeat the same test page") : id ? "Jalankan self-test printer" : "Run the printer self-test",
          instruction: id
            ? "Gunakan self-test bawaan printer atau test page di luar aplikasi POS."
            : "Use the printer's built-in self-test or a test page outside the POS app.",
          expectedResult: id
            ? "Printer bisa mencetak tanpa bantuan workflow POS."
            : "The printer can print without the POS workflow.",
          whyItMatters: id
            ? "Ini adalah pemisah tercepat antara fault hardware dan routing aplikasi."
            : "This is the fastest separator between a hardware fault and an app-routing fault.",
        },
        {
          id: "step-3",
          title: signals.lan ? (id ? "Validasi IP printer" : "Validate the printer IP") : signals.bluetooth ? (id ? "Pair ulang printer" : "Re-pair the printer") : id ? "Tinjau jalur koneksi" : "Review the connection path",
          instruction: signals.lan
            ? id
              ? "Cocokkan IP printer yang dipakai POS dengan IP printer yang aktif di jaringan."
              : "Match the printer IP used by the POS against the IP that is currently active on the network."
            : signals.bluetooth
              ? id
                ? "Hapus pairing lama lalu pair ulang printer dari terminal."
                : "Forget the old pairing and pair the printer again from the terminal."
              : id
                ? "Periksa ulang kabel USB, hub, atau jalur output yang dipakai POS."
                : "Inspect the USB cable, hub, or output path that the POS is using.",
          expectedResult: id
            ? "POS kembali punya jalur cetak yang valid."
            : "The POS regains a valid print path.",
          whyItMatters: id
            ? "Kebanyakan masalah printer struk ada di jalur output, bukan di mesin cetaknya."
            : "Most receipt-printer failures live in the output path rather than in the print engine itself.",
        },
      ];
    case "network-path":
      return [
        {
          id: "step-1",
          title: id ? "Pastikan perangkat ada di jaringan yang benar" : "Confirm the device is on the expected network",
          instruction: id
            ? "Cek SSID Wi-Fi atau port LAN yang dipakai perangkat saat ini."
            : "Check the current Wi-Fi SSID or the LAN path the device is using right now.",
          expectedResult: id
            ? "Perangkat terhubung ke jaringan toko yang semestinya."
            : "The device is attached to the intended store network.",
          whyItMatters: id
            ? "Berpindah jaringan diam-diam sering terlihat seperti aplikasi yang rusak."
            : "Silent network drift often masquerades as an app problem.",
        },
        {
          id: "step-2",
          title: id ? "Bandingkan dengan perangkat lain" : "Compare with another device",
          instruction: id
            ? "Uji browser atau layanan online yang sama di perangkat lain pada jaringan yang sama."
            : "Try the same browser page or online action on another device using the same network.",
          expectedResult: id
            ? "Terlihat apakah gangguan bersifat umum atau hanya lokal."
            : "You can see whether the fault is broad or only local.",
          whyItMatters: id
            ? "Perbandingan ini menentukan apakah Anda perlu fokus ke endpoint atau ke jaringan."
            : "That comparison tells you whether to focus on the endpoint or the network.",
        },
        {
          id: "step-3",
          title: id ? "Refresh endpoint lebih dulu" : "Refresh the endpoint first",
          instruction: id
            ? "Putuskan lalu sambungkan ulang Wi-Fi atau lease jaringan perangkat sebelum restart router."
            : "Reconnect the device Wi-Fi or renew the device network lease before restarting the router.",
          expectedResult: id
            ? "Perangkat pulih tanpa mengganggu endpoint lain."
            : "The endpoint recovers without disturbing the rest of the store.",
          whyItMatters: id
            ? "Ini menghindari restart besar jika masalahnya hanya satu endpoint."
            : "This avoids a broad restart when the fault only affects one endpoint.",
        },
      ];
    case "pos-flow":
      return [
        {
          id: "step-1",
          title: id ? "Ulangi satu transaksi kecil" : "Repeat one small transaction",
          instruction: id
            ? "Gunakan satu SKU dan satu kasir untuk melihat langkah mana yang pertama kali gagal."
            : "Use one SKU and one cashier flow to find the first step that fails.",
          expectedResult: id
            ? "Titik kegagalan POS menjadi lebih sempit."
            : "The POS failure point becomes narrower.",
          whyItMatters: id
            ? "Workflow kecil mengurangi noise dari data dan perangkat lain."
            : "A smaller workflow removes noise from other data and devices.",
        },
        {
          id: "step-2",
          title: id ? "Tinjau perubahan terakhir" : "Review the last change",
          instruction: id
            ? "Catat update aplikasi, perubahan setting, atau logout-login terakhir sebelum masalah muncul."
            : "Capture the last app update, setting change, or sign-out/sign-in event before the issue began.",
          expectedResult: id
            ? "Pemicu paling mungkin mulai terlihat."
            : "The most likely trigger starts to stand out.",
          whyItMatters: id
            ? "Masalah POS baru sering mengikuti satu perubahan yang baru terjadi."
            : "Fresh POS issues often follow one recent change.",
        },
        {
          id: "step-3",
          title: id ? "Segarkan state lokal" : "Refresh local state",
          instruction: id
            ? "Login ulang kasir atau muat ulang data referensi terminal jika workflow tetap macet."
            : "Re-sign the cashier or reload terminal reference data if the workflow stays stuck.",
          expectedResult: id
            ? "Workflow pulih atau pola macetnya menjadi konsisten."
            : "The workflow recovers or at least fails in a more consistent pattern.",
          whyItMatters: id
            ? "State lokal yang kotor sering terlihat seperti bug besar padahal hanya session yang tertahan."
            : "Dirty local state often looks like a major bug when it is really just a stuck session.",
        },
      ];
    default:
      return [
        {
          id: "step-1",
          title: id ? "Catat gejala paling sempit" : "Capture the narrowest symptom",
          instruction: id
            ? "Tuliskan aksi tepat yang memicu masalah dan satu perangkat yang terdampak."
            : "Write down the exact action that triggers the problem and the one device that is affected.",
          expectedResult: id
            ? "Ruang lingkup masalah menyempit."
            : "The scope of the issue gets narrower.",
          whyItMatters: id
            ? "Diagnosis menjadi lebih kuat saat gejalanya tidak bercampur."
            : "Diagnosis becomes stronger when the symptom is not blended with other noise.",
        },
        {
          id: "step-2",
          title: id ? "Cari perubahan terakhir" : "Find the last change",
          instruction: id
            ? "Tinjau kabel, jaringan, update aplikasi, atau perpindahan perangkat terakhir."
            : "Review the latest cable move, network change, app update, or device swap.",
          expectedResult: id
            ? "Pemicu yang mungkin mulai terlihat."
            : "A likely trigger starts to emerge.",
          whyItMatters: id
            ? "Perubahan terbaru sering memberi penjelasan tercepat."
            : "Recent changes often give the fastest explanation.",
        },
        {
          id: "step-3",
          title: id ? "Uji dengan skenario kecil" : "Test a smaller scenario",
          instruction: id
            ? "Ulangi masalah dengan satu skenario uji sederhana."
            : "Repeat the issue with one simple test scenario.",
          expectedResult: id
            ? "Masalah bisa direproduksi dengan pola yang lebih jelas."
            : "The issue reproduces in a clearer pattern.",
          whyItMatters: id
            ? "Tes kecil memisahkan masalah nyata dari noise operasional."
            : "A smaller test separates the real fault from operational noise.",
        },
      ];
  }
}

export function createFallbackDiagnosis(input: DiagnosisInput): DiagnosisResult {
  const profile = buildProfile(input);
  const signals = detectSignals(input);

  return {
    agentName: "Akari",
    mission: profile.mission,
    issueType: input.issueType,
    severity: profile.severity,
    confidence: profile.confidence,
    summary: profile.summary,
    probableCauses: profile.probableCauses,
    nextAction: profile.nextAction,
    escalationNeeded: profile.escalationNeeded,
    recommendedProducts: profile.recommendedProducts,
    recommendedServiceAction: profile.recommendedServiceAction,
    steps: buildSteps(profile, input.language, signals),
    runtime: {
      provider: "fallback",
      mode: "fallback",
      model: "adaptive-local-playbook",
    },
  };
}

export function createFallbackSummary(session: StoredSession): SessionSummary {
  const diagnosis = session.diagnosis;
  const id = session.language === "id";
  const profile = buildProfile(session);

  return {
    headline: diagnosis?.escalationNeeded
      ? id
        ? `${profile.headline} dan eskalasi`
        : `${profile.headline} and escalate`
      : profile.headline,
    overview: diagnosis?.summary ?? profile.summary,
    recommendedHandoff: profile.recommendedHandoff,
    runtime: diagnosis?.runtime ?? {
      provider: "fallback",
      mode: "fallback",
      model: "adaptive-local-playbook",
    },
    supportPacket: {
      category: session.issueType,
      severity: diagnosis?.severity ?? profile.severity,
      customerStory: session.symptoms,
      attemptedFixes:
        session.attemptedFixes ||
        (id
          ? "Pengguna belum mencatat percobaan perbaikan sebelumnya."
          : "The user did not log prior fixes."),
      nextBestAction:
        diagnosis?.recommendedServiceAction ??
        diagnosis?.nextAction ??
        profile.nextAction,
    },
  };
}
