// ============================================
// CATCHES LIST - Display recent catches for a water
// ============================================
import { useState, useEffect } from 'react';
import { Fish, Calendar, User, Weight, Loader } from 'lucide-react';

export const CatchesList = ({ waterId }) => {
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatches = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/catches/water/${waterId}`);
        if (res.ok) {
          const data = await res.json();
          setCatches(data.catches || []);
        }
      } catch (err) {
        console.log('Failed to fetch catches:', err);
      }
      setLoading(false);
    };

    if (waterId) {
      fetchCatches();
    }
  }, [waterId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (catches.length === 0) {
    return (
      <div className="text-center py-16">
        <Fish className="w-12 h-12 text-stone-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-stone-700 mb-2">No catches reported yet</h3>
        <p className="text-stone-500 text-sm">Be the first to report your catch at this water!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-stone-900">
          Recent Catches ({catches.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {catches.map((catchReport) => (
          <div
            key={catchReport.id}
            className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Fish className="w-6 h-6 text-brand-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-stone-900 mb-1">
                  {catchReport.species}
                </h4>
                <div className="space-y-1.5 text-sm text-stone-600">
                  {catchReport.weight && (
                    <div className="flex items-center gap-2">
                      <Weight className="w-4 h-4" />
                      <span>{catchReport.weight} lbs</span>
                    </div>
                  )}
                  {catchReport.anglerName && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{catchReport.anglerName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(catchReport.createdAt).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {catchReport.method && (
                    <div className="mt-2 text-xs text-stone-500">
                      Method: {catchReport.method}
                    </div>
                  )}
                </div>
                {catchReport.comment && (
                  <p className="mt-3 text-sm text-stone-700 bg-stone-50 rounded-lg p-3">
                    "{catchReport.comment}"
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {catches.length > 0 && (
        <div className="mt-6 p-4 bg-brand-50 border border-brand-200 rounded-xl">
          <p className="text-sm text-brand-800">
            <strong>Caught something here?</strong> Report your catch to help other anglers know what's biting!
          </p>
        </div>
      )}
    </div>
  );
};

export default CatchesList;
