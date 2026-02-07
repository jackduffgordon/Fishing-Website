// ============================================
// ADVANCED FILTERS COMPONENT
// Complete filter panel with all filter types
// ============================================
import { useState } from 'react';
import { ChevronDown, ChevronUp, X, Filter, SlidersHorizontal } from 'lucide-react';
import { PriceRangeSlider } from '../common/PriceRangeSlider';
import { ukSpecies } from '../../data/regions';

// Facilities list
const facilities = [
  { id: 'parking', label: 'Parking' },
  { id: 'cafe', label: 'Café/Restaurant' },
  { id: 'toilets', label: 'Toilets' },
  { id: 'disabled-access', label: 'Disabled Access' },
  { id: 'night-fishing', label: 'Night Fishing' },
  { id: 'tackle-shop', label: 'Tackle Shop' },
  { id: 'boat-hire', label: 'Boat Hire' }
];

// Experience levels
const experienceLevels = [
  { id: 'any', label: 'Any Level' },
  { id: 'beginner', label: 'Beginner Friendly' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' }
];

// Collapsible section component
const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-stone-200 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-medium text-stone-800 mb-3"
      >
        {title}
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-stone-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-400" />
        )}
      </button>
      {isOpen && children}
    </div>
  );
};

// Checkbox filter component
const CheckboxFilter = ({ options, selected, onChange, maxVisible = 6 }) => {
  const [showAll, setShowAll] = useState(false);
  const visibleOptions = showAll ? options : options.slice(0, maxVisible);

  return (
    <div className="space-y-2">
      {visibleOptions.map((option) => (
        <label key={option.id || option.name} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(option.id || option.name)}
            onChange={() => {
              const value = option.id || option.name;
              if (selected.includes(value)) {
                onChange(selected.filter(s => s !== value));
              } else {
                onChange([...selected, value]);
              }
            }}
            className="w-4 h-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-stone-600">{option.label || option.name}</span>
        </label>
      ))}
      {options.length > maxVisible && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-brand-600 hover:text-brand-800"
        >
          {showAll ? 'Show less' : `Show all ${options.length}`}
        </button>
      )}
    </div>
  );
};

// Radio filter component
const RadioFilter = ({ options, selected, onChange }) => (
  <div className="space-y-2">
    {options.map((option) => (
      <label key={option.id} className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name="experienceLevel"
          checked={selected === option.id}
          onChange={() => onChange(option.id)}
          className="w-4 h-4 border-stone-300 text-brand-600 focus:ring-brand-500"
        />
        <span className="text-sm text-stone-600">{option.label}</span>
      </label>
    ))}
  </div>
);

// Toggle switch component
const ToggleSwitch = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between cursor-pointer">
    <span className="text-sm text-stone-600">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-brand-600' : 'bg-stone-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </label>
);

export const AdvancedFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  regions = []
}) => {
  const activeFilterCount = [
    filters.priceRange[0] !== 10 || filters.priceRange[1] !== 500,
    filters.species.length > 0,
    filters.experienceLevel !== 'any',
    filters.facilities.length > 0,
    filters.weekendOnly,
    filters.fishingType,
    filters.region
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-brand-600" />
          Filters
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-brand-100 text-brand-700 text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-brand-600 hover:text-brand-800"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Fishing Type */}
      <FilterSection title="Fishing Type">
        <div className="flex flex-wrap gap-2">
          {['', 'game', 'coarse', 'sea'].map((type) => (
            <button
              key={type}
              onClick={() => onFilterChange({ ...filters, fishingType: type })}
              className={`px-3 py-1.5 rounded-full text-sm transition ${
                filters.fishingType === type
                  ? 'bg-brand-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {type === '' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Region */}
      <FilterSection title="Region">
        <select
          value={filters.region}
          onChange={(e) => onFilterChange({ ...filters, region: e.target.value })}
          className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white"
        >
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r.id} value={r.name}>{r.name}</option>
          ))}
        </select>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <PriceRangeSlider
          min={10}
          max={500}
          value={filters.priceRange}
          onChange={(value) => onFilterChange({ ...filters, priceRange: value })}
        />
      </FilterSection>

      {/* Species */}
      <FilterSection title="Species" defaultOpen={false}>
        <CheckboxFilter
          options={ukSpecies}
          selected={filters.species}
          onChange={(value) => onFilterChange({ ...filters, species: value })}
        />
      </FilterSection>

      {/* Experience Level */}
      <FilterSection title="Experience Level">
        <RadioFilter
          options={experienceLevels}
          selected={filters.experienceLevel}
          onChange={(value) => onFilterChange({ ...filters, experienceLevel: value })}
        />
      </FilterSection>

      {/* Facilities */}
      <FilterSection title="Facilities" defaultOpen={false}>
        <CheckboxFilter
          options={facilities}
          selected={filters.facilities}
          onChange={(value) => onFilterChange({ ...filters, facilities: value })}
          maxVisible={5}
        />
      </FilterSection>

      {/* Weekend Availability */}
      <FilterSection title="Availability">
        <ToggleSwitch
          label="Available this weekend"
          checked={filters.weekendOnly}
          onChange={(value) => onFilterChange({ ...filters, weekendOnly: value })}
        />
      </FilterSection>
    </div>
  );
};

// Mobile filter drawer
export const MobileFilterDrawer = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
  onApply,
  regions = []
}) => {
  if (!isOpen) return null;

  const activeFilterCount = [
    filters.priceRange[0] !== 10 || filters.priceRange[1] !== 500,
    filters.species.length > 0,
    filters.experienceLevel !== 'any',
    filters.facilities.length > 0,
    filters.weekendOnly,
    filters.fishingType,
    filters.region
  ].filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-brand-100 text-brand-700 text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex-1 overflow-y-auto p-4">
          <AdvancedFilters
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            regions={regions}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 flex gap-3">
          <button
            onClick={onClearFilters}
            className="flex-1 py-3 border border-stone-300 rounded-xl font-medium hover:bg-stone-50"
          >
            Clear All
          </button>
          <button
            onClick={onApply}
            className="flex-1 py-3 bg-brand-700 text-white rounded-xl font-medium hover:bg-brand-800"
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
