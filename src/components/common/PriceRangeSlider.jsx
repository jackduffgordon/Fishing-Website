// ============================================
// PRICE RANGE SLIDER COMPONENT
// Dual-handle price range selector
// ============================================
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export const PriceRangeSlider = ({
  min = 0,
  max = 500,
  value = [0, 500],
  onChange,
  step = 5,
  formatLabel = (val) => `£${val}`
}) => {
  return (
    <div className="px-2">
      {/* Labels */}
      <div className="flex justify-between mb-2 text-sm">
        <span className="font-medium text-brand-700">{formatLabel(value[0])}</span>
        <span className="font-medium text-brand-700">{formatLabel(value[1])}</span>
      </div>

      {/* Slider */}
      <Slider
        range
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        step={step}
        trackStyle={[{ backgroundColor: '#0f766e', height: 6 }]}
        handleStyle={[
          {
            borderColor: '#0f766e',
            backgroundColor: 'white',
            width: 20,
            height: 20,
            marginTop: -7,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            opacity: 1
          },
          {
            borderColor: '#0f766e',
            backgroundColor: 'white',
            width: 20,
            height: 20,
            marginTop: -7,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            opacity: 1
          }
        ]}
        railStyle={{ backgroundColor: '#e7e5e4', height: 6 }}
      />

      {/* Min/Max labels */}
      <div className="flex justify-between mt-1 text-xs text-stone-400">
        <span>{formatLabel(min)}</span>
        <span>{formatLabel(max)}+</span>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
