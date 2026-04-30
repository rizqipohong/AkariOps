import type { AiRuntime, AppLanguage, IssueType, Severity, StepStatus } from "@/types/diagnosis";

export const DEFAULT_LANGUAGE: AppLanguage = "en";
export const LANGUAGE_STORAGE_KEY = "akariops-language";

const copy = {
  en: {
    navDiagnose: "Diagnose",
    navHistory: "History",
    navEnglish: "English",
    navIndonesian: "Indonesia",
    brandSubtitle: "AI Anime Field Guide for Retail Systems",
    heroEyebrow: "Challenge-ready AI product",
    heroTitle: "Anime-led support for scanner, POS, printer, and network failures.",
    heroBody:
      "AkariOps is a browser-based AI troubleshooting experience with an original anime-inspired identity. The assistant is the product engine: it triages, diagnoses, and decides the next action before support handoff.",
    launchDiagnosis: "Launch diagnosis",
    viewSessionArchive: "View session archive",
    coreCapability: "Core capability",
    intakeTitle: "AI-led intake",
    intakeBody: "The workflow begins with fault capture, category selection, and context gathering.",
    structuredTitle: "Structured diagnosis",
    structuredBody:
      "Akari returns probable causes, severity, confidence, and test steps in JSON-backed UI state.",
    escalationTitle: "Escalation summary",
    escalationBody:
      "When the issue remains unresolved, the app compresses the journey into a handoff packet.",
    deploymentEyebrow: "Deployment path",
    deploymentTitle: "Built for Next.js + OpenAI or OpenRouter + Vercel.",
    deploymentBody:
      "The app keeps API keys server-side with route handlers, can call OpenAI or OpenRouter live, stores MVP session history in local storage, and is designed so the frontend can ship independently on Vercel.",
    characterIdentity: "Character identity",
    mascotTitle: "Akari leads the diagnosis like a calm signal runner.",
    mascotBody:
      "The AI is not framed as a generic chat bubble. It acts like an original anime-style field guide that reads symptoms, chooses the right troubleshooting path, and decides when a human handoff is the smarter move.",
    missionIntake: "Mission intake",
    diagnosisHeading: "Describe the failure. Akari maps the next move.",
    issueCategory: "Issue category",
    symptoms: "Symptoms",
    symptomsPlaceholder:
      "Example: The scanner lights up but no barcode appears in the POS search field.",
    attemptedFixes: "What has already been tried?",
    attemptedFixesPlaceholder:
      "Example: Replugged USB, restarted the POS tablet, tested a second barcode.",
    tracingFault: "Akari is tracing the fault...",
    diagnosisLoadingTitle: "Akari is building the diagnosis map.",
    diagnosisLoadingBody:
      "The AI is reading the symptom, matching likely failure paths, and turning that into a structured troubleshooting flow.",
    diagnosisLoadingStepOne: "Reading the symptom and attempted fixes",
    diagnosisLoadingStepTwo: "Ranking likely causes for this exact issue",
    diagnosisLoadingStepThree: "Building practical troubleshooting steps",
    runDiagnosis: "Run Akari diagnosis",
    diagnosisFailed: "Diagnosis failed.",
    diagnosisResult: "Diagnosis result",
    confidence: "Confidence",
    category: "Category",
    severity: "Severity",
    escalation: "Escalation",
    model: "Model",
    recommended: "Recommended",
    notYet: "Not yet",
    probableCauses: "Probable causes",
    troubleshootingSteps: "Troubleshooting steps",
    passed: "passed",
    failed: "failed",
    pending: "pending",
    expected: "Expected",
    whyItMatters: "Why it matters",
    markPassed: "Mark passed",
    stillFailing: "Still failing",
    nextMove: "Next move",
    supportPath: "Support path",
    suggestedBackups: "Suggested backups",
    buildHandoffSummary: "Build handoff summary",
    viewSessionHistory: "View session history",
    awaitingDiagnosis: "Awaiting diagnosis",
    noFaultMapYet: "No fault map yet.",
    emptyDiagnosisBody:
      "Start with a clear symptom report. Akari will return structured causes, step-by-step tests, and an escalation recommendation if the case looks risky.",
    liveOpenAI: "Live OpenAI",
    liveOpenRouter: "Live OpenRouter",
    localFallback: "Local fallback",
    supportReadyHandoff: "Support-ready handoff",
    preparingSummary: "Preparing the summary...",
    preparingSummaryBody:
      "Akari is compressing the diagnosis into a support packet that a human agent can use immediately.",
    generatingHandoff: "Generating the handoff packet...",
    summaryLoadingTitle: "Akari is preparing the support handoff.",
    summaryLoadingBody:
      "The AI is compressing the diagnosis into a concise packet so the next human support agent can continue without repeating intake.",
    summaryLoadingStepOne: "Reviewing the diagnosis and severity",
    summaryLoadingStepTwo: "Extracting the most useful support context",
    summaryLoadingStepThree: "Writing the next best action for handoff",
    sessionNotFound: "Session not found",
    sessionNotFoundBody: "Return to the diagnosis workspace and create a session first.",
    startDiagnosis: "Start diagnosis",
    summaryFailed: "Unable to build summary.",
    recommendedHandoff: "Recommended handoff",
    customerStory: "Customer story",
    attemptedFixesLabel: "Attempted fixes",
    nextBestAction: "Next best action",
    casePacket: "Case packet",
    backToDiagnosis: "Back to diagnosis",
    viewHistory: "View history",
    historyEyebrow: "Mission archive",
    historyTitle: "Local diagnosis sessions",
    draftSession: "Draft session",
    updated: "Updated",
    reopenSession: "Reopen session",
    viewSummary: "View summary",
    noSessionsYet: "No sessions yet.",
    noSessionsBody: "Create your first AI-guided diagnosis to populate the archive.",
    severityLow: "Low",
    severityMedium: "Medium",
    severityHigh: "High",
    severityCritical: "Critical",
    issueScanner: "Scanner",
    issueScannerDescription: "Barcode scan fails or returns nothing.",
    issueReceiptPrinter: "Receipt Printer",
    issueReceiptPrinterDescription: "Printer is connected but not printing reliably.",
    issuePos: "POS System",
    issuePosDescription: "POS actions freeze, lag, or behave inconsistently.",
    issueNetwork: "Network",
    issueNetworkDescription: "Devices cannot reach the internet or local services.",
    issueInventorySync: "Inventory Sync",
    issueInventorySyncDescription: "Stock or order data looks delayed or mismatched.",
    issueOther: "Other",
    issueOtherDescription: "Use this when the issue spans multiple categories.",
  },
  id: {
    navDiagnose: "Diagnosis",
    navHistory: "Riwayat",
    navEnglish: "English",
    navIndonesian: "Indonesia",
    brandSubtitle: "Pemandu AI Bergaya Anime untuk Sistem Retail",
    heroEyebrow: "Produk AI siap challenge",
    heroTitle: "Dukungan bergaya anime untuk masalah scanner, POS, printer, dan jaringan.",
    heroBody:
      "AkariOps adalah pengalaman troubleshooting berbasis browser dengan identitas orisinal bergaya anime. Asisten ini menjadi mesin utama produk: melakukan triage, diagnosis, dan menentukan langkah berikutnya sebelum handoff ke support.",
    launchDiagnosis: "Mulai diagnosis",
    viewSessionArchive: "Lihat arsip sesi",
    coreCapability: "Kemampuan utama",
    intakeTitle: "Intake berbasis AI",
    intakeBody: "Alur dimulai dari penangkapan gejala, pemilihan kategori, dan pengumpulan konteks.",
    structuredTitle: "Diagnosis terstruktur",
    structuredBody:
      "Akari mengembalikan kemungkinan penyebab, tingkat keparahan, confidence, dan langkah pengecekan dalam state UI berbasis JSON.",
    escalationTitle: "Ringkasan eskalasi",
    escalationBody:
      "Saat masalah belum selesai, aplikasi merangkum perjalanan diagnosis menjadi paket handoff.",
    deploymentEyebrow: "Arah deployment",
    deploymentTitle: "Dibangun untuk Next.js + OpenAI atau OpenRouter + Vercel.",
    deploymentBody:
      "Aplikasi menyimpan API key di sisi server lewat route handlers, bisa memanggil OpenAI atau OpenRouter secara live, menyimpan riwayat sesi MVP di local storage, dan dirancang agar frontend bisa dikirim mandiri ke Vercel.",
    characterIdentity: "Identitas karakter",
    mascotTitle: "Akari memimpin diagnosis seperti pengarah sinyal yang tenang.",
    mascotBody:
      "AI ini tidak diposisikan sebagai bubble chat generik. Ia bertindak seperti pemandu lapangan bergaya anime yang membaca gejala, memilih jalur troubleshooting yang tepat, dan memutuskan kapan handoff ke manusia lebih masuk akal.",
    missionIntake: "Intake misi",
    diagnosisHeading: "Jelaskan gangguannya. Akari akan memetakan langkah berikutnya.",
    issueCategory: "Kategori masalah",
    symptoms: "Gejala",
    symptomsPlaceholder:
      "Contoh: Scanner menyala tetapi hasil scan tidak masuk ke kolom pencarian POS.",
    attemptedFixes: "Apa yang sudah dicoba?",
    attemptedFixesPlaceholder:
      "Contoh: Cabut pasang USB, restart tablet POS, dan tes barcode lain.",
    tracingFault: "Akari sedang menelusuri masalah...",
    diagnosisLoadingTitle: "Akari sedang menyusun peta diagnosis.",
    diagnosisLoadingBody:
      "AI sedang membaca gejala, mencocokkan jalur gangguan yang paling mungkin, lalu mengubahnya menjadi alur troubleshooting yang terstruktur.",
    diagnosisLoadingStepOne: "Membaca gejala dan perbaikan yang sudah dicoba",
    diagnosisLoadingStepTwo: "Mengurutkan kemungkinan penyebab untuk kasus ini",
    diagnosisLoadingStepThree: "Menyusun langkah troubleshooting yang praktis",
    runDiagnosis: "Jalankan diagnosis Akari",
    diagnosisFailed: "Diagnosis gagal.",
    diagnosisResult: "Hasil diagnosis",
    confidence: "Confidence",
    category: "Kategori",
    severity: "Severity",
    escalation: "Eskalasi",
    model: "Model",
    recommended: "Disarankan",
    notYet: "Belum",
    probableCauses: "Kemungkinan penyebab",
    troubleshootingSteps: "Langkah troubleshooting",
    passed: "berhasil",
    failed: "gagal",
    pending: "menunggu",
    expected: "Hasil yang diharapkan",
    whyItMatters: "Kenapa ini penting",
    markPassed: "Tandai berhasil",
    stillFailing: "Masih gagal",
    nextMove: "Langkah berikutnya",
    supportPath: "Arah support",
    suggestedBackups: "Cadangan yang disarankan",
    buildHandoffSummary: "Buat ringkasan handoff",
    viewSessionHistory: "Lihat riwayat sesi",
    awaitingDiagnosis: "Menunggu diagnosis",
    noFaultMapYet: "Belum ada peta masalah.",
    emptyDiagnosisBody:
      "Mulai dengan laporan gejala yang jelas. Akari akan mengembalikan penyebab terstruktur, langkah pengecekan bertahap, dan rekomendasi eskalasi bila kasusnya berisiko.",
    liveOpenAI: "OpenAI live",
    liveOpenRouter: "OpenRouter live",
    localFallback: "Fallback lokal",
    supportReadyHandoff: "Handoff siap untuk support",
    preparingSummary: "Menyiapkan ringkasan...",
    preparingSummaryBody:
      "Akari sedang merangkum diagnosis menjadi paket support yang bisa langsung dipakai agen manusia.",
    generatingHandoff: "Membuat paket handoff...",
    summaryLoadingTitle: "Akari sedang menyiapkan handoff untuk support.",
    summaryLoadingBody:
      "AI sedang merangkum diagnosis menjadi paket singkat agar agen support berikutnya bisa langsung lanjut tanpa mengulang intake.",
    summaryLoadingStepOne: "Meninjau hasil diagnosis dan tingkat keparahan",
    summaryLoadingStepTwo: "Mengambil konteks support yang paling penting",
    summaryLoadingStepThree: "Menulis tindakan terbaik berikutnya untuk handoff",
    sessionNotFound: "Sesi tidak ditemukan",
    sessionNotFoundBody: "Kembali ke workspace diagnosis dan buat sesi terlebih dahulu.",
    startDiagnosis: "Mulai diagnosis",
    summaryFailed: "Gagal membuat ringkasan.",
    recommendedHandoff: "Handoff yang disarankan",
    customerStory: "Cerita pelanggan",
    attemptedFixesLabel: "Perbaikan yang sudah dicoba",
    nextBestAction: "Tindakan terbaik berikutnya",
    casePacket: "Paket kasus",
    backToDiagnosis: "Kembali ke diagnosis",
    viewHistory: "Lihat riwayat",
    historyEyebrow: "Arsip misi",
    historyTitle: "Sesi diagnosis lokal",
    draftSession: "Sesi draft",
    updated: "Diperbarui",
    reopenSession: "Buka lagi sesi",
    viewSummary: "Lihat ringkasan",
    noSessionsYet: "Belum ada sesi.",
    noSessionsBody: "Buat diagnosis berbantuan AI pertama untuk mengisi arsip.",
    severityLow: "Rendah",
    severityMedium: "Sedang",
    severityHigh: "Tinggi",
    severityCritical: "Kritis",
    issueScanner: "Scanner",
    issueScannerDescription: "Scan barcode gagal atau tidak menghasilkan apa pun.",
    issueReceiptPrinter: "Printer Struk",
    issueReceiptPrinterDescription: "Printer terhubung tetapi tidak mencetak dengan normal.",
    issuePos: "Sistem POS",
    issuePosDescription: "Aksi POS macet, lambat, atau tidak konsisten.",
    issueNetwork: "Jaringan",
    issueNetworkDescription: "Perangkat tidak dapat menjangkau internet atau layanan lokal.",
    issueInventorySync: "Sinkronisasi Stok",
    issueInventorySyncDescription: "Data stok atau pesanan terlihat terlambat atau tidak sinkron.",
    issueOther: "Lainnya",
    issueOtherDescription: "Gunakan ini jika masalah mencakup beberapa kategori.",
  },
} as const;

export function getCopy(language: AppLanguage) {
  return copy[language];
}

export function issueTypeLabel(issueType: IssueType, language: AppLanguage): string {
  const t = getCopy(language);

  switch (issueType) {
    case "scanner":
      return t.issueScanner;
    case "receipt-printer":
      return t.issueReceiptPrinter;
    case "pos":
      return t.issuePos;
    case "network":
      return t.issueNetwork;
    case "inventory-sync":
      return t.issueInventorySync;
    case "other":
      return t.issueOther;
  }
}

export function issueOptions(language: AppLanguage) {
  const t = getCopy(language);

  return [
    { value: "scanner" as const, title: t.issueScanner, description: t.issueScannerDescription },
    {
      value: "receipt-printer" as const,
      title: t.issueReceiptPrinter,
      description: t.issueReceiptPrinterDescription,
    },
    { value: "pos" as const, title: t.issuePos, description: t.issuePosDescription },
    { value: "network" as const, title: t.issueNetwork, description: t.issueNetworkDescription },
    {
      value: "inventory-sync" as const,
      title: t.issueInventorySync,
      description: t.issueInventorySyncDescription,
    },
    { value: "other" as const, title: t.issueOther, description: t.issueOtherDescription },
  ];
}

export function severityLabel(severity: Severity, language: AppLanguage): string {
  const t = getCopy(language);

  switch (severity) {
    case "low":
      return t.severityLow;
    case "medium":
      return t.severityMedium;
    case "high":
      return t.severityHigh;
    case "critical":
      return t.severityCritical;
  }
}

export function stepStatusLabel(status: StepStatus, language: AppLanguage): string {
  const t = getCopy(language);

  switch (status) {
    case "passed":
      return t.passed;
    case "failed":
      return t.failed;
    case "pending":
      return t.pending;
  }
}

export function runtimeLabel(runtime: AiRuntime, language: AppLanguage): string {
  const t = getCopy(language);

  if (runtime.mode === "fallback") {
    return t.localFallback;
  }

  return runtime.provider === "openrouter" ? t.liveOpenRouter : t.liveOpenAI;
}
