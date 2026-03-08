'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Loader2, CheckCircle, AlertCircle, X,
  Activity, User, Stethoscope, Pill, ClipboardList, FileSearch, Heart, ScanLine
} from 'lucide-react';

interface AnalysisResponse {
  success: boolean;
  analysis?: string;
  filename?: string;
  error?: string;
  message?: string;
}

interface Section {
  heading: string;
  emoji: string;
  content: string[];
}

const SECTION_CONFIG: Record<string, { icon: React.ReactNode; color: string; border: string; bg: string }> = {
  'Document Type':        { icon: <FileText size={15} />,      color: 'text-sky-700',    border: 'border-sky-200',    bg: 'bg-sky-50' },
  'Patient Information':  { icon: <User size={15} />,          color: 'text-violet-700', border: 'border-violet-200', bg: 'bg-violet-50' },
  'Key Findings':         { icon: <FileSearch size={15} />,    color: 'text-amber-700',  border: 'border-amber-200',  bg: 'bg-amber-50' },
  'Vital Signs':          { icon: <Activity size={15} />,      color: 'text-emerald-700',border: 'border-emerald-200',bg: 'bg-emerald-50' },
  'Observations':         { icon: <Activity size={15} />,      color: 'text-emerald-700',border: 'border-emerald-200',bg: 'bg-emerald-50' },
  'Diagnosis':            { icon: <Stethoscope size={15} />,   color: 'text-red-700',    border: 'border-red-200',    bg: 'bg-red-50' },
  'Medications':          { icon: <Pill size={15} />,          color: 'text-teal-700',   border: 'border-teal-200',   bg: 'bg-teal-50' },
  'Treatment':            { icon: <Pill size={15} />,          color: 'text-teal-700',   border: 'border-teal-200',   bg: 'bg-teal-50' },
  'Outcome':              { icon: <Heart size={15} />,         color: 'text-pink-700',   border: 'border-pink-200',   bg: 'bg-pink-50' },
  'Recommendations':      { icon: <ClipboardList size={15} />, color: 'text-indigo-700', border: 'border-indigo-200', bg: 'bg-indigo-50' },
  'Follow-up':            { icon: <ClipboardList size={15} />, color: 'text-indigo-700', border: 'border-indigo-200', bg: 'bg-indigo-50' },
  'Summary':              { icon: <FileText size={15} />,      color: 'text-gray-700',   border: 'border-gray-200',   bg: 'bg-gray-50' },
};

function getConfig(heading: string) {
  for (const key of Object.keys(SECTION_CONFIG)) {
    if (heading.toLowerCase().includes(key.toLowerCase())) return SECTION_CONFIG[key];
  }
  return { icon: <FileText size={15} />, color: 'text-gray-700', border: 'border-gray-200', bg: 'bg-gray-50' };
}

function parseAnalysis(raw: string): Section[] {
  const lines = raw.split('\n');
  const sections: Section[] = [];
  let current: Section | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      if (current) sections.push(current);
      const full = trimmed.replace('## ', '').trim();
      const firstChar = [...full][0] || '';
      const isEmoji = firstChar.codePointAt(0)! > 127;
      const emoji = isEmoji ? firstChar : '';
      const heading = isEmoji ? full.slice(firstChar.length).trim() : full;
      current = { heading, emoji, content: [] };
    } else if (trimmed && current) {
      current.content.push(trimmed);
    }
  }
  if (current) sections.push(current);
  if (sections.length === 0 && raw.trim()) {
    return [{ heading: 'Analysis', emoji: '📋', content: raw.split('\n').filter(Boolean) }];
  }
  return sections;
}

function AnalysisRow({ label, value }: { label: string; value: string }) {
  const isMissing = /not mention|not fill|n\/a|not record|not specif/i.test(value);
  return (
    <div className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-32 shrink-0 pt-0.5">{label}</span>
      <span className={`text-sm leading-relaxed ${isMissing ? 'text-gray-400 italic' : 'text-gray-800 font-medium'}`}>{value}</span>
    </div>
  );
}

function SectionCard({ section, index }: { section: Section; index: number }) {
  const cfg = getConfig(section.heading);
  const isStructured = section.content.some(l => {
    const ci = l.indexOf(':');
    return ci > 0 && ci < 35 && l.length > ci + 2;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      className={`rounded-xl border ${cfg.border} overflow-hidden`}
    >
      <div className={`px-5 py-3 ${cfg.bg} border-b ${cfg.border} flex items-center gap-2`}>
        <span className={cfg.color}>{cfg.icon}</span>
        <h4 className={`text-sm font-semibold ${cfg.color} tracking-wide`}>{section.heading}</h4>
      </div>
      <div className="px-5 py-4 bg-white">
        {isStructured ? (
          <div>
            {section.content.map((line, i) => {
              const ci = line.indexOf(':');
              if (ci > 0 && ci < 35) {
                const label = line.substring(0, ci).replace(/\*/g, '').trim();
                const value = line.substring(ci + 1).replace(/\*/g, '').trim() || '—';
                return <AnalysisRow key={i} label={label} value={value} />;
              }
              return (
                <p key={i} className="text-sm text-gray-700 leading-relaxed py-0.5"
                  dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
              );
            })}
          </div>
        ) : (
          <div className="space-y-1">
            {section.content.map((line, i) => (
              <p key={i} className="text-sm text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-900">$1</strong>') }} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Render PDF pages to base64 images using PDF.js ──────────────────────────
async function renderPDFToImages(file: File): Promise<string[]> {
  if (!(window as any).pdfjsLib) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load PDF.js'));
      document.head.appendChild(script);
    });
    (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  const pdfjsLib = (window as any).pdfjsLib;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const images: string[] = [];

  const pageCount = Math.min(pdf.numPages, 3);
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
    images.push(base64);
  }

  return images;
}

export default function MedicalOCRAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f?.type === 'application/pdf') { setFile(f); setError(''); }
    else if (f) setError('Please upload a PDF file only.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f?.type === 'application/pdf') { setFile(f); setError(''); }
    else if (f) setError('Please upload a PDF file only.');
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError('');
    setResults(null);
    setProcessingStep('Extracting document text...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data: AnalysisResponse = await response.json();

      // Scanned PDF — render pages and retry with Gemini Vision
      if (response.status === 422 && data.error === 'SCANNED_PDF') {
        setProcessingStep('Scanned PDF detected — rendering pages for AI vision...');

        let images: string[] = [];
        try {
          images = await renderPDFToImages(file);
        } catch (e) {
          setError('Unable to render this scanned PDF. Please try uploading a text-based PDF.');
          setIsProcessing(false);
          return;
        }

        setProcessingStep(`Analyzing ${images.length} page(s) with AI vision...`);

        const formData2 = new FormData();
        formData2.append('file', file);
        for (const img of images) formData2.append('imagePage', img);

        const response2 = await fetch('/api/analyze', { method: 'POST', body: formData2 });
        const data2: AnalysisResponse = await response2.json();

        if (!response2.ok || !data2.success) {
          setError(data2.error || 'Failed to analyze the scanned document.');
          return;
        }
        setResults(data2);
        return;
      }

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to analyze the document.');
        return;
      }
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const clearAll = () => { setFile(null); setResults(null); setError(''); };
  const sections = results?.analysis ? parseAnalysis(results.analysis) : [];

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-3 tracking-wide uppercase">
          <Activity size={11} /> AI-Powered
        </div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Medical Report Analyzer</h2>
        <p className="text-gray-500 mt-2 text-sm">Upload any medical PDF — text-based or scanned — for instant AI analysis</p>
      </motion.div>

      {/* Upload Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-5">

        <div
          className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
            dragActive ? 'border-blue-400 bg-blue-50' :
            file ? 'border-emerald-400 bg-emerald-50/40' :
                   'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
          }`}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        >
          <input type="file" id="file-upload" accept=".pdf" onChange={handleFileChange} className="hidden" />
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center py-10 px-6 cursor-pointer">
            {file ? (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="text-emerald-600" size={28} />
                </div>
                <p className="font-semibold text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · PDF</p>
              </motion.div>
            ) : (
              <div className="text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Upload className="text-blue-600" size={26} />
                </div>
                <p className="font-semibold text-gray-700 mb-1">Drop your PDF here</p>
                <p className="text-xs text-gray-400">Text-based or scanned PDF · up to 10 MB</p>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <span className="flex items-center gap-1 text-xs text-gray-400"><FileText size={11} /> Text PDFs</span>
                  <span className="text-gray-300">·</span>
                  <span className="flex items-center gap-1 text-xs text-gray-400"><ScanLine size={11} /> Scanned PDFs</span>
                </div>
              </div>
            )}
          </label>
          {file && (
            <button onClick={clearAll}
              className="absolute top-3 right-3 w-7 h-7 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 rounded-full flex items-center justify-center transition-colors shadow-sm">
              <X size={14} className="text-gray-500" />
            </button>
          )}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle size={17} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 leading-relaxed">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Button */}
        <button onClick={handleProcess} disabled={!file || isProcessing}
          className={`w-full mt-5 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
            !file || isProcessing
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-[0.99]'
          }`}>
          {isProcessing
            ? <><Loader2 size={17} className="animate-spin" /> {processingStep || 'Analyzing...'}</>
            : <><Stethoscope size={17} /> Analyze Medical Report</>}
        </button>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {results?.success && results.analysis && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-gray-700">Analysis Complete</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                <FileText size={11} /> {results.filename}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {sections.map((section, i) => <SectionCard key={i} section={section} index={i} />)}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={15} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.
              </p>
            </motion.div>

            <button onClick={clearAll}
              className="mt-4 w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <Upload size={14} /> Analyze Another Report
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 shadow-2xl text-center w-80">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Analyzing Report</h3>
              <p className="text-sm text-gray-500 mb-6">{processingStep || 'AI is reading your medical document...'}</p>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-blue-500 rounded-full"
                  initial={{ width: '0%' }} animate={{ width: '90%' }} transition={{ duration: 10, ease: 'easeOut' }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}