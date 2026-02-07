// ============================================
// DATE PICKER CALENDAR COMPONENT
// Wrapper for react-datepicker with availability styling
// ============================================
import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';

// Custom input component
const CustomInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <button
    type="button"
    onClick={onClick}
    ref={ref}
    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-left flex items-center gap-2 hover:border-brand-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition bg-white"
  >
    <Calendar className="w-5 h-5 text-stone-400" />
    <span className={value ? 'text-stone-800' : 'text-stone-400'}>
      {value || placeholder || 'Select date'}
    </span>
  </button>
));

CustomInput.displayName = 'CustomInput';

export const DatePickerCalendar = ({
  selected,
  onChange,
  availability = {},
  minDate = new Date(),
  maxDate,
  placeholder = 'Select date',
  showPrice = true,
  selectsRange = false,
  startDate,
  endDate,
  inline = false,
  disabled = false
}) => {
  // Get day class based on availability
  const getDayClassName = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const status = availability[dateStr];

    if (!status) return '';

    switch (status.status) {
      case 'available':
        return 'day-available';
      case 'booked':
        return 'day-booked';
      case 'closed':
        return 'day-closed';
      default:
        return '';
    }
  };

  // Filter available dates
  const filterDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const status = availability[dateStr];

    // If no availability data, allow all dates
    if (!status) return true;

    // Only allow available dates
    return status.status === 'available';
  };

  // Render day contents with price
  const renderDayContents = (day, date) => {
    if (!showPrice) return day;

    const dateStr = date.toISOString().split('T')[0];
    const status = availability[dateStr];

    return (
      <div className="relative">
        <span>{day}</span>
        {status?.price && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-medium text-brand-700">
            £{status.price}
          </span>
        )}
      </div>
    );
  };

  // Get price for selected date
  const getSelectedPrice = () => {
    if (!selected) return null;
    const dateStr = selected.toISOString().split('T')[0];
    return availability[dateStr]?.price;
  };

  return (
    <div className="date-picker-container">
      <DatePicker
        selected={selected}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        filterDate={Object.keys(availability).length > 0 ? filterDate : undefined}
        dayClassName={getDayClassName}
        renderDayContents={renderDayContents}
        customInput={<CustomInput placeholder={placeholder} />}
        inline={inline}
        disabled={disabled}
        selectsRange={selectsRange}
        startDate={startDate}
        endDate={endDate}
        dateFormat="dd MMM yyyy"
        calendarStartDay={1} // Start week on Monday
        showPopperArrow={false}
        popperPlacement="bottom-start"
        popperModifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ]}
      />

      {/* Show selected date price */}
      {showPrice && selected && getSelectedPrice() && (
        <div className="mt-2 text-sm text-stone-600">
          Price for selected date: <span className="font-semibold text-brand-700">£{getSelectedPrice()}</span>
        </div>
      )}
    </div>
  );
};

// Date Range Picker variant
export const DateRangePicker = ({
  startDate,
  endDate,
  onChange,
  minDate = new Date(),
  placeholder = 'Select dates'
}) => {
  return (
    <DatePicker
      selectsRange
      startDate={startDate}
      endDate={endDate}
      onChange={onChange}
      minDate={minDate}
      customInput={<CustomInput placeholder={placeholder} />}
      dateFormat="dd MMM yyyy"
      calendarStartDay={1}
      showPopperArrow={false}
      monthsShown={2}
    />
  );
};

export default DatePickerCalendar;
