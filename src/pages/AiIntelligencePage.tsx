import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { getAllDocuments } from '../services/dbService';
import { DocumentRecord } from '../types';

export const AiIntelligencePage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [customText, setCustomText] = useState('');
  const [fileName, setFileName] = useState('FIR_Investigation_Brief.txt');

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisType, setAnalysisType] = useState<'classify' | 'extract' | 'summarize'>('classify');
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDocs() {
      try {
        const d = await getAllDocuments();
        setDocuments(d);
        if (d.length > 0) {
          setSelectedDocId(d[0].documentId);
          setCustomText(d[0].textContent || d[0].summary || '');
          setFileName(d[0].fileName);
        }
      } catch (err) {
        console.error('Failed to load docs for AI workbench:', err);
      }
    }
    loadDocs();
  }, []);

  const handleDocumentSelect = (docId: string) => {
    setSelectedDocId(docId);
    const doc = documents.find(d => d.documentId === docId);
    if (doc) {
      setCustomText(doc.textContent || doc.summary || '');
      setFileName(doc.fileName);
      setResult(null);
    }
  };

  const handleRunAnalysis = async () => {
    if (!customText.trim() && !fileName) {
      setError('Please provide document text or select a case document.');
      return;
    }
    setAnalyzing(true);
    setError(null);
    setResult(null);

    const endpoint = `/api/ai/${analysisType}`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: customText,
          fileName
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
      } else {
        setError(data.error || 'AI analysis operation failed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error communicating with AI engine.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#D7DFE4]">
        <div className="text-xs font-mono text-[#6A7885] uppercase tracking-wider">
          Forensic NLP & Machine Intelligence
        </div>
        <h1 className="text-2xl font-bold text-[#29323A] mt-1 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#29323A]" />
          <span>AI Document Intelligence Workbench</span>
        </h1>
        <p className="text-xs text-[#5C6A76] mt-1">
          Server-side neural document categorization, named entity extraction, and legal summarization powered by Google Gemini API.
        </p>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded bg-[#E7EBEE] border border-[#CBD4DA] text-xs text-[#29323A] font-sans flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#29323A] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-semibold">Mandatory AI Evidentiary Disclaimer:</strong>
          <p className="text-[#5C6A76] text-[11px] leading-relaxed">
            AI-generated content. Verify against the original source document before relying on it. In accordance with judicial evidence standards, AI predictions are strictly organizational aids and do not determine legal guilt, innocence, or evidentiary validity.
          </p>
        </div>
      </div>

      {/* Two Column Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Text / Document Source */}
        <div className="p-6 rounded bg-white border border-[#D7DFE4] space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7EBEE]">
            <h2 className="text-xs font-mono uppercase text-[#29323A] font-bold">
              Document Input Source
            </h2>
            <span className="text-[10px] text-[#6A7885] font-mono">Select or Paste</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#29323A] font-semibold mb-1">
                Load from Registered Vault Document:
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => handleDocumentSelect(e.target.value)}
                className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] font-mono focus:outline-none focus:border-[#29323A] focus:bg-white"
              >
                {documents.map(d => (
                  <option key={d.documentId} value={d.documentId}>
                    {d.fileName} ({d.documentType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#29323A] font-semibold mb-1">
                File Identifier / Title:
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded px-3 py-2 text-[#29323A] font-mono focus:outline-none focus:border-[#29323A] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[#29323A] font-semibold mb-1">
                Document Body / Excerpt Text:
              </label>
              <textarea
                rows={8}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Paste witness depositions, FIR text, or forensic report excerpts..."
                className="w-full bg-[#F4F6F8] border border-[#D7DFE4] rounded p-3 text-[#29323A] font-mono text-xs focus:outline-none focus:border-[#29323A] focus:bg-white leading-relaxed"
              />
            </div>

            {/* Analysis Selector Buttons */}
            <div>
              <label className="block text-[#5C6A76] text-[11px] font-mono uppercase mb-1.5">
                Select Intelligence Mode:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAnalysisType('classify')}
                  className={`py-2 px-2.5 rounded font-mono text-xs uppercase font-semibold transition-colors ${
                    analysisType === 'classify'
                      ? 'bg-[#29323A] text-white'
                      : 'bg-white text-[#29323A] hover:bg-[#E7EBEE] border border-[#CBD4DA]'
                  }`}
                >
                  Classify
                </button>
                <button
                  type="button"
                  onClick={() => setAnalysisType('extract')}
                  className={`py-2 px-2.5 rounded font-mono text-xs uppercase font-semibold transition-colors ${
                    analysisType === 'extract'
                      ? 'bg-[#29323A] text-white'
                      : 'bg-white text-[#29323A] hover:bg-[#E7EBEE] border border-[#CBD4DA]'
                  }`}
                >
                  Extract Entities
                </button>
                <button
                  type="button"
                  onClick={() => setAnalysisType('summarize')}
                  className={`py-2 px-2.5 rounded font-mono text-xs uppercase font-semibold transition-colors ${
                    analysisType === 'summarize'
                      ? 'bg-[#29323A] text-white'
                      : 'bg-white text-[#29323A] hover:bg-[#E7EBEE] border border-[#CBD4DA]'
                  }`}
                >
                  Summarize
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="w-full mt-2 py-3 rounded bg-[#29323A] hover:bg-[#3A454F] text-white font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>{analyzing ? 'Executing Model Inference...' : 'Analyze Document with Gemini'}</span>
            </button>
          </div>
        </div>

        {/* Right: AI Output Panel */}
        <div className="p-6 rounded bg-white border border-[#D7DFE4] space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7EBEE]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#29323A]" />
              <h2 className="text-xs font-mono uppercase text-[#29323A] font-bold">
                Inference Results ({analysisType.toUpperCase()})
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E7EBEE] text-[#29323A] border border-[#CBD4DA]">
              gemini-3.8-flash
            </span>
          </div>

          {error && (
            <div className="p-3 bg-[#29323A] text-white text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#E7EBEE]" />
              <span>{error}</span>
            </div>
          )}

          {analyzing ? (
            <div className="p-16 text-center text-xs font-mono text-[#6A7885] space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#29323A] border-t-transparent animate-spin mx-auto" />
              <div>Transmitting encrypted token payload to Google GenAI server proxy...</div>
            </div>
          ) : result ? (
            <div className="space-y-4 text-xs font-sans">
              {/* Classification Output */}
              {analysisType === 'classify' && (
                <div className="space-y-3">
                  <div className="p-4 rounded bg-[#F4F6F8] border border-[#D7DFE4] font-mono space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6A7885]">Classified Category:</span>
                      <span className="text-[#29323A] font-bold text-sm">{result.documentType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6A7885]">Confidence Score:</span>
                      <span className="text-[#29323A] font-bold">{result.confidence}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-[#E7EBEE] border border-[#CBD4DA] space-y-1">
                    <span className="font-mono text-[#5C6A76] text-[10px] uppercase font-bold block">Classification Basis:</span>
                    <p className="text-[#29323A] leading-relaxed">{result.reason}</p>
                  </div>

                  {result.suggestedTags && (
                    <div className="space-y-1">
                      <span className="font-mono text-[#6A7885] text-[10px] uppercase font-bold block">Recommended Legal Index Tags:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.suggestedTags.map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 rounded bg-white text-[#29323A] border border-[#CBD4DA] font-mono text-[10px]">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Extraction Output */}
              {analysisType === 'extract' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2.5 rounded bg-[#F4F6F8] border border-[#D7DFE4]">
                      <span className="text-[#6A7885] block">Case Numbers:</span>
                      <span className="text-[#29323A] font-bold">{result.caseNumbers?.join(', ') || 'N/A'}</span>
                    </div>
                    <div className="p-2.5 rounded bg-[#F4F6F8] border border-[#D7DFE4]">
                      <span className="text-[#6A7885] block">Dates:</span>
                      <span className="text-[#29323A]">{result.dates?.join(', ') || 'N/A'}</span>
                    </div>
                    <div className="p-2.5 rounded bg-[#F4F6F8] border border-[#D7DFE4]">
                      <span className="text-[#6A7885] block">Persons Named:</span>
                      <span className="text-[#29323A]">{result.persons?.join(', ') || 'N/A'}</span>
                    </div>
                    <div className="p-2.5 rounded bg-[#F4F6F8] border border-[#D7DFE4]">
                      <span className="text-[#6A7885] block">Institutions:</span>
                      <span className="text-[#29323A]">{result.organizations?.join(', ') || 'N/A'}</span>
                    </div>
                  </div>

                  {result.sectionsReferenced && (
                    <div className="p-3 rounded bg-[#E7EBEE] border border-[#CBD4DA] text-[11px] font-mono space-y-1">
                      <span className="text-[#29323A] block font-bold">Statutory Sections Referenced:</span>
                      <div className="text-[#5C6A76]">{result.sectionsReferenced.join(' • ')}</div>
                    </div>
                  )}

                  {result.summary && (
                    <div className="p-3 rounded bg-[#F4F6F8] border border-[#D7DFE4] space-y-1">
                      <span className="font-mono text-[#6A7885] text-[10px] uppercase font-bold block">Entity Context Abstract:</span>
                      <p className="text-[#5C6A76] leading-relaxed">{result.summary}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Summarize Output */}
              {analysisType === 'summarize' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded bg-[#E7EBEE] border border-[#CBD4DA] text-[#29323A] leading-relaxed">
                    <strong className="text-[#29323A] font-mono text-[10px] uppercase block mb-1">
                      Executive Summary:
                    </strong>
                    {result.executiveSummary}
                  </div>

                  {result.keyFindings && (
                    <div className="p-3 rounded bg-[#F4F6F8] border border-[#D7DFE4] space-y-1.5">
                      <span className="font-mono text-[#6A7885] text-[10px] uppercase font-bold block">Key Investigative Findings:</span>
                      <ul className="list-disc list-inside space-y-1 text-[#5C6A76]">
                        {result.keyFindings.map((f: string, idx: number) => (
                          <li key={idx}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.evidentiaryValue && (
                    <div className="p-3 rounded bg-white border border-[#CBD4DA] space-y-1 text-[11px]">
                      <span className="font-mono text-[#29323A] text-[10px] uppercase font-bold block">Probative Evidentiary Value:</span>
                      <p className="text-[#5C6A76]">{result.evidentiaryValue}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-16 text-center text-xs text-[#8695A2] font-mono">
              Select an intelligence mode on the left and click "Analyze Document" to run Gemini inference.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
