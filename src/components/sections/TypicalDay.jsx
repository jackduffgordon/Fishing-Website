// ============================================
// TYPICAL DAY SECTION COMPONENT
// Timeline-style itinerary display
// ============================================
import { Clock } from 'lucide-react';

export const TypicalDay = ({ itinerary = [] }) => {
  if (!itinerary || itinerary.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-brand-600" />
        Typical Day
      </h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-brand-200" />

        {/* Timeline items */}
        <div className="space-y-4">
          {itinerary.map((item, index) => (
            <div key={index} className="flex gap-4">
              {/* Time badge */}
              <div className="relative z-10">
                <div className="w-14 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-medium text-brand-700">{item.time}</span>
                </div>
              </div>

              {/* Activity */}
              <div className="flex-1 bg-stone-50 rounded-xl p-4">
                <p className="text-stone-700">{item.activity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TypicalDay;
