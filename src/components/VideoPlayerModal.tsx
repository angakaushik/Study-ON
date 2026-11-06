import React, { useState } from 'react';
import { LearningVideoItem } from '../types.ts';
import { X, Play, Pause, Clock, User, Bookmark, CheckCircle2 } from 'lucide-react';

interface VideoPlayerModalProps {
  video: LearningVideoItem | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeSpeed, setActiveSpeed] = useState<number>(1.0);
  const [noteText, setNoteText] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([
    'Key point: Balances heights dynamically upon insertion.',
  ]);

  if (!video) return null;

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    setSavedNotes((prev) => [...prev, noteText.trim()]);
    setNoteText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl border border-sky-100 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-sky-50/70 border-b border-sky-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {video.title}
            </h3>
            <p className="text-xs text-sky-800">
              {video.subject} · Instructor: {video.teacherName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-sky-100/70 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player and Controls */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-video flex items-center justify-center group shadow-md">
            <video
              src={video.videoUrl}
              className="w-full h-full object-contain"
              controls
              autoPlay
            />
          </div>

          {/* Video Metadata & Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Lesson Overview
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {video.description}
                </p>
              </div>

              {/* Lecture Timestamps */}
              <div>
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Lecture Chapters & Key Timestamps
                </h5>
                <div className="space-y-1.5">
                  {video.keyTimestamps.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-xl bg-sky-50/60 border border-sky-100 text-xs hover:bg-sky-100/50 cursor-pointer transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="font-mono font-bold text-sky-900">{item.time}</span>
                      <span className="text-slate-700 truncate">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* In-Lecture Digital Notes */}
            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-950 mb-2">
                  <Bookmark className="w-3.5 h-3.5 text-sky-600" />
                  <span>Student Video Notes</span>
                </div>
                <div className="space-y-2 mb-3 max-h-36 overflow-y-auto">
                  {savedNotes.map((n, i) => (
                    <div key={i} className="text-[11px] p-2 bg-white rounded-lg border border-sky-100 text-slate-700">
                      • {n}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Take a quick note..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-sky-200 text-xs outline-none bg-white focus:border-sky-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="w-full py-1.5 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-sky-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>Teacher Approved Educational Content</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-sky-200 text-sky-900 hover:bg-sky-50 text-xs font-semibold"
          >
            Close Video
          </button>
        </div>
      </div>
    </div>
  );
};
