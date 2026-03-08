import { NextRequest, NextResponse } from "next/server";
import zlib from "zlib";

// ─── Medical keyword pre-check ────────────────────────────────────────────────
const MEDICAL_KEYWORDS = [
  "patient", "diagnosis", "prescription", "medication", "doctor", "hospital",
  "clinic", "blood", "glucose", "hemoglobin", "cholesterol", "pulse",
  "blood pressure", "temperature", "respiration", "oxygen", "defibrillator",
  "cpr", "cardiopulmonary", "resuscitation", "symptoms", "injury", "fracture",
  "bleeding", "nausea", "vomiting", "pain", "fever", "allergy", "surgery",
  "treatment", "discharge", "admission", "lab", "test result", "report",
  "incident report", "medical incident", "cabin crew", "casualty",
  "unconscious", "ambulance", "icu", "emergency", "x-ray", "mri", "ecg",
  "vaccination", "immunization", "pathology", "radiology", "biopsy",
  "health checkup", "medical history", "drug", "dose", "tablet", "capsule",
  "hypertension", "diabetes", "rhinitis", "lisinopril", "loratadine",
  "icd-10", "icd", "mmhg", "bpm", "subjective", "objective", "assessment",
  "vital signs", "auscultation", "edema", "murmur", "encounter", "provider",
  "orthopedic", "cervical", "spine", "shoulder", "tendinosis", "bursitis",
  "calcaneum", "neurological", "investigation", "examination", "tenderness",
];

function containsMedicalKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  let count = 0;
  for (const kw of MEDICAL_KEYWORDS) {
    if (lower.includes(kw)) {
      count++;
      if (count >= 3) return true;
    }
  }
  return false;
}

// ─── CMap parser ──────────────────────────────────────────────────────────────
type CMap = Map<number, string>;

function parseCMap(text: string): CMap {
  const map: CMap = new Map();
  const bfcharBlocks = text.match(/beginbfchar([\s\S]*?)endbfchar/g) || [];
  for (const block of bfcharBlocks) {
    const pairs = block.match(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g) || [];
    for (const pair of pairs) {
      const m = pair.match(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/);
      if (m) {
        try { map.set(parseInt(m[1], 16), String.fromCodePoint(parseInt(m[2], 16))); } catch {}
      }
    }
  }
  const bfrangeBlocks = text.match(/beginbfrange([\s\S]*?)endbfrange/g) || [];
  for (const block of bfrangeBlocks) {
    const triples = block.match(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g) || [];
    for (const triple of triples) {
      const m = triple.match(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/);
      if (m) {
        const start = parseInt(m[1], 16), end = parseInt(m[2], 16), dst = parseInt(m[3], 16);
        for (let i = 0; i <= end - start; i++) {
          try { map.set(start + i, String.fromCodePoint(dst + i)); } catch {}
        }
      }
    }
  }
  return map;
}

// ─── PDF text extractor ───────────────────────────────────────────────────────
function extractTextFromPDF(buffer: Buffer): string {
  let allText = "";
  const cmaps: CMap[] = [];
  const decompressedStreams: string[] = [];

  let pos = 0;
  while (pos < buffer.length) {
    const si = buffer.indexOf(Buffer.from("stream"), pos);
    if (si === -1) break;
    let dataStart = si + 6;
    if (buffer[dataStart] === 0x0d) dataStart++;
    if (buffer[dataStart] === 0x0a) dataStart++;
    const ei = buffer.indexOf(Buffer.from("endstream"), dataStart);
    if (ei === -1) break;
    let dataEnd = ei;
    if (dataEnd > 0 && buffer[dataEnd - 1] === 0x0a) dataEnd--;
    if (dataEnd > 0 && buffer[dataEnd - 1] === 0x0d) dataEnd--;

    const streamData = buffer.slice(dataStart, dataEnd);
    let decompressed: Buffer | null = null;
    try { decompressed = zlib.inflateSync(streamData); }
    catch { try { decompressed = zlib.inflateRawSync(streamData); } catch { decompressed = streamData; } }
    if (decompressed) decompressedStreams.push(decompressed.toString("latin1"));
    pos = ei + 9;
  }

  for (const text of decompressedStreams) {
    if (text.includes("begincmap")) {
      const cm = parseCMap(text);
      if (cm.size > 0) cmaps.push(cm);
    }
  }

  for (const text of decompressedStreams) {
    if (!text.includes("BT") || !text.includes("ET")) continue;
    const stdTj = text.match(/\(([^()]{1,300})\)\s*(?:Tj|'|")/g) || [];
    for (const m of stdTj) { const i = m.match(/\(([^()]+)\)/); if (i) allText += i[1] + " "; }
    const stdTjArr = text.match(/\[([^\]]{1,800})\]\s*TJ/g) || [];
    for (const m of stdTjArr) { const w = m.match(/\(([^()]+)\)/g) || []; allText += w.map((x) => x.slice(1, -1)).join("") + " "; }
    if (cmaps.length > 0) {
      const hexTj = text.match(/<[0-9A-Fa-f]+>\s*Tj/g) || [];
      for (const m of hexTj) {
        const hx = m.match(/<([0-9A-Fa-f]+)>/);
        if (hx) { const code = parseInt(hx[1], 16); for (const cm of cmaps) { if (cm.has(code)) { allText += cm.get(code); break; } } }
      }
      const hexArr = text.match(/\[<[^\]]+>\]\s*TJ/g) || [];
      for (const m of hexArr) {
        const codes = m.match(/<([0-9A-Fa-f]+)>/g) || [];
        for (const code of codes) { const n = parseInt(code.slice(1, -1), 16); for (const cm of cmaps) { if (cm.has(n)) { allText += cm.get(n); break; } } }
        allText += " ";
      }
    }
  }

  return allText.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, " ").replace(/\s+/g, " ").trim().substring(0, 4000);
}

// ─── Groq call (text-based PDF) ───────────────────────────────────────────────
async function callGroq(prompt: string): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) throw new Error("GROQ_API_KEY not configured");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

// ─── Groq Vision call (scanned/image-based PDF) ───────────────────────────────
async function callGroqVision(base64Images: string[]): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) throw new Error("GROQ_API_KEY not configured");

  const messages: any[] = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `You are a professional medical document analyzer for SwasthAI health platform.

Analyze this scanned medical document image carefully and provide a structured report.

If this is NOT a medical/health document, reply ONLY with:
NOT_MEDICAL: [One sentence: what this document is and why it's not medical]

If it IS a medical document, provide structured analysis with EXACTLY these sections (skip sections with no content):

## 📄 Document Type
[What kind of medical document]

## 👤 Patient Information
Name: [value or "Not mentioned"]
Age / DOB: [value or "Not mentioned"]
Gender: [value or "Not mentioned"]
[Other fields if present: Civil ID, File No, Department, Nationality, Date]

## 🔬 Key Findings / Clinical Notes
[Symptoms, complaints, diagnosis details, clinical observations]

## 📊 Vital Signs & Observations
[BP, HR, Temperature, Oxygen, Respiration and any numerical values with units]

## 🏥 Diagnosis / Conditions
[All diagnoses, conditions, ICD codes if present]

## 💊 Medications & Treatment Plan
[Medications, dosages, treatment instructions, procedures]

## 📋 Recommendations & Follow-up
[Doctor's instructions, follow-up, referrals]

## 📝 Summary
[2-3 sentences summarizing the document]`
        },
        ...base64Images.map(img => ({
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${img}`
          }
        }))
      ]
    }
  ];

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages,
      max_tokens: 2048,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq Vision error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

// ─── Analysis prompts ─────────────────────────────────────────────────────────
function getMedicalAnalysisPrompt(text: string): string {
  return `You are a professional medical document analyzer for SwasthAI health platform.

The following is confirmed medical content. Analyze it thoroughly and provide a structured report using EXACTLY these section headings. Skip sections with no relevant content.

## 📄 Document Type
[SOAP note, lab report, prescription, discharge summary, incident report, radiology report, etc.]

## 👤 Patient Information
Name: [value or "Not mentioned"]
Age / DOB: [value or "Not mentioned"]
Gender: [value or "Not mentioned"]
[Add: Provider, Date, File No, Department, Civil ID if present]

## 🔬 Key Findings / Clinical Notes
[Symptoms, complaints, clinical history, or incident description]

## 📊 Vital Signs & Observations
[BP, HR, Temperature, Oxygen, Respiration and any numerical values with units]

## 🏥 Diagnosis / Conditions
[All diagnoses with ICD codes if present]

## 💊 Medications & Treatment Plan
[Medications, dosages, instructions, procedures]

## 📋 Recommendations & Follow-up
[Doctor's instructions, follow-up schedule, referrals, patient tasks]

## 📝 Summary
[2-3 sentences clearly summarizing this document]

Document text:
${text}`;
}

function getDetectionPrompt(text: string): string {
  return `You are a professional medical document analyzer for SwasthAI health platform.

Is the following document medical or health-related?

Medical documents include: blood tests, lab reports, prescriptions, SOAP notes, discharge summaries, medical incident reports, health checkups, diagnostic reports, vaccination records, doctor notes, clinical observations, ECG/MRI/X-ray reports, pathology reports, radiology reports, orthopedic reports, etc.

NON-medical: exam registration slips, resumes, legal contracts, financial statements, property documents, government ID forms, shopping receipts, academic transcripts, etc.

If NOT medical, reply ONLY with:
NOT_MEDICAL: [One sentence: what is this document and why it is not medical]

If IS medical, provide structured analysis with these sections:
## 📄 Document Type
## 👤 Patient Information
## 🔬 Key Findings / Clinical Notes
## 📊 Vital Signs & Observations
## 🏥 Diagnosis / Conditions
## 💊 Medications & Treatment Plan
## 📋 Recommendations & Follow-up
## 📝 Summary

Document:
${text}`;
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const imagePages = formData.getAll("imagePage") as string[];

    if (!file)
      return NextResponse.json({ success: false, error: "No file uploaded." }, { status: 400 });

    if (file.type !== "application/pdf")
      return NextResponse.json({ success: false, error: "Please upload a PDF file." }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const extractedText = extractTextFromPDF(buffer);

    console.log("[analyze] Extracted text length:", extractedText.length);
    console.log("[analyze] Sample:", extractedText.substring(0, 200));
    console.log("[analyze] Image pages received:", imagePages.length);

    // ── Case 1: Scanned PDF — images sent from frontend ──
    if (imagePages.length > 0) {
      console.log("[analyze] Using Groq Vision for scanned PDF");
      const result = await callGroqVision(imagePages);

      if (result.toUpperCase().startsWith("NOT_MEDICAL:")) {
        const reason = result.replace(/NOT_MEDICAL:/i, "").trim();
        return NextResponse.json(
          { success: false, error: `This document does not appear to be a medical record. ${reason} Please upload a medical report, lab test, prescription, or health-related document.` },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, analysis: result, filename: file.name });
    }

    // ── Case 2: Text extracted — use Groq ──
    if (extractedText.length > 60) {
      const isMedical = containsMedicalKeywords(extractedText + " " + file.name);
      console.log("[analyze] Medical keywords match:", isMedical);

      const prompt = isMedical
        ? getMedicalAnalysisPrompt(extractedText)
        : getDetectionPrompt(extractedText);

      const result = await callGroq(prompt);

      if (result.toUpperCase().startsWith("NOT_MEDICAL:")) {
        const reason = result.replace(/NOT_MEDICAL:/i, "").trim();
        return NextResponse.json(
          { success: false, error: `This document does not appear to be a medical record. ${reason} Please upload a medical report, lab test, prescription, or health-related document.` },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, analysis: result, filename: file.name });
    }

    // ── Case 3: No text, no images — scanned PDF, ask frontend to render ──
    console.log("[analyze] No text extracted — returning SCANNED_PDF signal");
    return NextResponse.json(
      {
        success: false,
        error: "SCANNED_PDF",
        message: "This appears to be a scanned/image-based PDF. Rendering pages for AI vision analysis...",
      },
      { status: 422 }
    );

  } catch (error: any) {
    console.error("[analyze] Error:", error);

    if (error.message?.includes("GROQ_API_KEY")) {
      return NextResponse.json(
        { success: false, error: "Groq API key not configured. Please add GROQ_API_KEY to .env.local" },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to analyze the document. Please try again." },
      { status: 500 }
    );
  }
}