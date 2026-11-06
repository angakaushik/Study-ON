import React, { useState } from 'react';
import { NoteItem } from '../types.ts';
import { X, Download, ZoomIn, ZoomOut, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PDFReaderModalProps {
  note: NoteItem | null;
  onClose: () => void;
  onRecordReading?: (pages: number) => void;
}

export const PDFReaderModal: React.FC<PDFReaderModalProps> = ({
  note,
  onClose,
  onRecordReading,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!note) return null;

  const totalPages = note.pagesCount;

  const handleDownload = () => {
    if (!note.downloadAllowed) return;

    // Simulate real file download in web environment
    const blob = new Blob(
      [
        `StudyOn Digital Note\nTitle: ${note.title}\nSubject: ${note.subject}\nFaculty: ${note.facultyName}\nDate: ${note.uploadDate}\n\nSUMMARY:\n${note.summary}\n\n${note.contentSnippet.join('\n\n')}`,
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      onRecordReading?.(1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-sky-100 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-sky-100 flex items-center justify-between bg-sky-50/60">
          <div className="flex items-center gap-3 pr-2 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {note.title}
              </h3>
              <p className="text-xs text-sky-800 truncate">
                {note.subject} · {note.facultyName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {note.downloadAllowed ? (
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-sky-300 text-sky-800 hover:bg-sky-50 active:bg-sky-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                title="Download verified digital note"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            ) : (
              <span className="text-[11px] font-medium text-slate-500 px-2 py-1 rounded bg-slate-100 border border-slate-200">
                In-app view only
              </span>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-sky-100/70 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Download notification banner */}
        {downloadSuccess && (
          <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Digital note downloaded successfully. Paperless delivery verified!</span>
          </div>
        )}

        {/* Reader Document Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-sky-50/30">
          <div
            className="mx-auto bg-white rounded-2xl shadow-sm border border-sky-200/80 p-6 sm:p-10 max-w-2xl transition-all"
            style={{ fontSize: `${zoomLevel}%` }}
          >
            {/* Document Header */}
            <div className="border-b border-sky-100 pb-4 mb-6">
              <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                <span>ST. JUDE INSTITUTE · DIGITAL COURSE HANDOUT</span>
                <span>Page {currentPage} of {totalPages}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">{note.title}</h2>
              <p className="text-xs text-sky-800 font-medium">
                Faculty Instructor: {note.facultyName} · Uploaded: {note.uploadDate}
              </p>
            </div>

            {/* Document Overview Abstract */}
            <div className="mb-6 p-4 rounded-xl bg-sky-50 border border-sky-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p className="font-semibold text-sky-900 mb-1">Lecture Module Abstract:</p>
              <p>{note.summary}</p>
            </div>

            {/* Document Content Snippets based on page */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
              {note.contentSnippet.map((paragraph, index) => (
                <div
                  key={index}
                  className={`p-3.5 rounded-xl border ${
                    index + 1 === currentPage
                      ? 'border-sky-300 bg-sky-50/60'
                      : 'border-slate-100 bg-white'
                  }`}
                >
                  <p className="font-medium text-slate-900 mb-1">
                    Section {index + 1}:
                  </p>
                  <p>{paragraph}</p>
                </div>
              ))}
            </div>

            {/* Footer watermark notice */}
            <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-500">
              Verified Educational Resource · StudyOn Student Educator Platform
            </div>
          </div>
        </div>

        {/* Reader Bottom Controls */}
        <div className="px-5 py-3 border-t border-sky-100 bg-white flex items-center justify-between text-xs font-medium text-slate-700">
          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
              className="p-1.5 rounded-lg border border-sky-200 hover:bg-sky-50 text-slate-600"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-slate-600 text-xs">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
              className="p-1.5 rounded-lg border border-sky-200 hover:bg-sky-50 text-slate-600"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-xl border border-sky-200 hover:bg-sky-50 disabled:opacity-40 disabled:hover:bg-white text-xs font-semibold text-sky-900"
            >
              Previous Page
            </button>
            <span className="text-xs font-bold text-slate-800">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-40 text-xs font-semibold text-white"
            >
              Next Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
