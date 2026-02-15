// ============================================
// INSTRUCTORS PAGE - API-powered with hardcoded fallback
// ============================================
import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { InstructorCard } from '../components/cards/InstructorCard';
import { instructors as hardcodedInstructors } from '../data/instructors';
import { instructorsAPI } from '../utils/api';

export const InstructorsPage = ({ onSelectInstructor, onBack }) => {
  const [allInstructors, setAllInstructors] = useState(hardcodedInstructors);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ specialty: '' });

  // Fetch from API on mount
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const apiInstructors = await instructorsAPI.getAll();
        if (apiInstructors && apiInstructors.length > 0) {
          const apiNames = new Set(apiInstructors.map(i => i.name.toLowerCase()));
          const uniqueHardcoded = hardcodedInstructors.filter(
            i => !apiNames.has(i.name.toLowerCase())
          );
          setAllInstructors([...apiInstructors, ...uniqueHardcoded]);
        }
      } catch (err) {
        console.log('API unavailable, using local data:', err.message);
      }
      setLoading(false);
    };
    fetchInstructors();
  }, []);

  const specialties = [...new Set(allInstructors.flatMap((i) => i.specialties || []))];

  const filteredInstructors = allInstructors.filter(
    (i) => !filters.specialty || (i.specialties || []).includes(filters.specialty)
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-brand-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Find a Fishing Instructor</h1>
          <p className="text-brand-100">
            Learn from {allInstructors.length} certified instructors across the UK
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 sticky top-24">
              <h3 className="font-semibold mb-4">Filter by Specialty</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setFilters({ specialty: '' })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    !filters.specialty ? 'bg-brand-50 text-brand-700' : 'hover:bg-stone-50'
                  }`}
                >
                  All Instructors
                </button>
                {specialties.slice(0, 12).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilters({ specialty: s })}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      filters.specialty === s ? 'bg-brand-50 text-brand-700' : 'hover:bg-stone-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {loading ? (
              <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
                <Loader className="w-8 h-8 text-brand-600 mx-auto mb-3 animate-spin" />
                <p className="text-stone-500">Loading instructors...</p>
              </div>
            ) : filteredInstructors.length > 0 ? (
              filteredInstructors.map((i) => (
                <InstructorCard
                  key={i.id}
                  instructor={i}
                  onClick={() => onSelectInstructor(i)}
                />
              ))
            ) : (
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
