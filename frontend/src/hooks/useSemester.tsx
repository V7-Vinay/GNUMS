import { useState, useRef, useEffect } from 'react';
import { ChevronDown, GraduationCap } from 'lucide-react';

export type SemFilter = 'all' | number;

const ALL_SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export const useSemester = () => {
  const [selectedSem, setSelectedSem] = useState<SemFilter>('all');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const label = selectedSem === 'all' ? 'All Semesters' : `Semester ${selectedSem}`;

  const SemesterDropdown = () => (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all shadow-sm ${
          selectedSem !== 'all'
            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600'
        }`}
      >
        <GraduationCap className="w-4 h-4" />
        <span>{label}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Filter by Semester
            </p>
          </div>

          {/* All option */}
          <button
            onClick={() => { setSelectedSem('all'); setOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
              selectedSem === 'all'
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
              selectedSem === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              All
            </span>
            All Semesters
            {selectedSem === 'all' && (
              <span className="ml-auto w-2 h-2 rounded-full bg-blue-600" />
            )}
          </button>

          {/* Divider */}
          <div className="mx-4 border-t border-gray-100" />

          {/* Semester grid */}
          <div className="p-3 grid grid-cols-4 gap-1.5">
            {ALL_SEMESTERS.map((sem) => (
              <button
                key={sem}
                onClick={() => { setSelectedSem(sem); setOpen(false); }}
                className={`h-10 rounded-xl text-sm font-semibold transition-all ${
                  selectedSem === sem
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                {sem}
              </button>
            ))}
          </div>

          {/* Footer label */}
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-400 text-center">Tap a number to select</p>
          </div>
        </div>
      )}
    </div>
  );

  return { selectedSem, setSelectedSem, SemesterDropdown };
};