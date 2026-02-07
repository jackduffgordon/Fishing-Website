// ============================================
// INSTRUCTORS PAGE
// Browse and filter fishing instructors
// ============================================
import { useState } from 'react';
import { InstructorCard } from '../components/cards/InstructorCard';
import { instructors } from '../data/instructors';

export const InstructorsPage = ({ onSelectInstructor, onBack }) => {
  const [filters, setFilters] = useState({ specialty: '' });

  // Get unique specialties
  const specialties = [...new Set(instructors.flatMap((i) => i.specialties))];

  // Filter instructors
  const filteredInstructors = instructors.filter(
    (i) => !filters.specialty || i.specialties.includes(filters.specialty)
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-brand-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Find a Fishing Instructor</h1>
          <p className="text-brand-100">
            Learn from {instructors.length} certified instructors across the UK
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 sticky top-24">
              <h3 className="font-semibold mb-4">Filter by Specialty</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setFilters({ specialty: '' })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    !filters.specialty
                      ? 'bg-brand-50 text-brand-700'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  All Instructors
                </button>
                {specialties.slice(0, 12).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilters({ specialty: s })}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      filters.specialty === s
                        ? 'bg-brand-50 text-brand-700'
                        : 'hover:bg-stone-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Instructor list */}
          <div className="flex-1 space-y-4">
            {filteredInstructors.map((i) => (
              <InstructorCard
                key={i.id}
                instructor={i}
                onClick={() => onSelectInstructor(i)}
              />
            ))}
            {filteredInstructors.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl">
                <p className="text-stone-500">No instructors match your filter.</p>
                <button
                  onClick={() => setFilters({ specialty: '' })}
                  className="mt-2 text-brand-600 hover:text-brand-700"
                >
                  Clear filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorsPage;
