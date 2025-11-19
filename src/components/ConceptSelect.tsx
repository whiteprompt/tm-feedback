'use client';

import Select from 'react-select';
import { EXPENSE_CONCEPTS } from '@/lib/constants';

interface ConceptSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  showQuickButtons?: boolean;
  usePortal?: boolean;
}

const QUICK_CONCEPTS = [
  EXPENSE_CONCEPTS.find(c => c.value === "expenses")!,
  EXPENSE_CONCEPTS.find(c => c.value === "food-drinks")!,
  EXPENSE_CONCEPTS.find(c => c.value === "licenses")!,
];

export default function ConceptSelect({
  value,
  onChange,
  placeholder = "Select concept",
  className = "",
  required = false,
  showQuickButtons = true,
  usePortal = false
}: ConceptSelectProps) {
  // Helper function to find concept by value or label
  const findConcept = (searchValue: string) => {
    return EXPENSE_CONCEPTS.find(concept => 
      concept.value === searchValue || concept.label === searchValue
    );
  };

  // Helper function to get the correct value format for quick buttons
  const getQuickButtonValue = (conceptValue: string) => {
    const concept = EXPENSE_CONCEPTS.find(c => c.value === conceptValue);
    return concept ? concept.label : conceptValue;
  };

  const handleQuickSelect = (conceptValue: string) => {
    const conceptLabel = getQuickButtonValue(conceptValue);
    onChange(conceptLabel);
  };

  // Determine if we're using value or label format based on current value
  const currentConcept = findConcept(value);
  return (
    <div className={`
      space-y-3
      ${className}
    `}>
      {showQuickButtons && (
        <div className="flex flex-wrap gap-2">
          {QUICK_CONCEPTS.map((concept) => {
            const buttonValue = getQuickButtonValue(concept.value);
            const isActive = value === buttonValue || value === concept.value;
            
            return (
              <button
                key={concept.value}
                type="button"
                onClick={() => handleQuickSelect(concept.value)}
                className={`
                  rounded-lg px-3 py-1.5 text-sm font-medium transition-all
                  duration-300
                  ${
                  isActive
                    ? 'bg-wp-primary text-white'
                    : `
                      bg-wp-primary/20 text-wp-primary
                      hover:bg-wp-primary/30
                    `
                }
                `}
              >
                {concept.label}
              </button>
            );
          })}
        </div>
      )}
      
      <Select
        options={EXPENSE_CONCEPTS}
        value={currentConcept}
        onChange={(selected) => {
          if (selected) {
            // Return label format to match existing form behavior
            onChange(selected.label);
          } else {
            onChange('');
          }
        }}
        placeholder={placeholder}
        className="basic-single"
        classNamePrefix="select"
        isClearable={!required}
        menuPortalTarget={usePortal && typeof document !== 'undefined' ? document.body : null}
        menuPosition={usePortal ? 'fixed' : 'absolute'}
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: 'rgba(26, 26, 46, 0.6)',
            borderColor: 'rgba(64, 75, 104, 0.3)',
            color: '#E2E8F0',
            minHeight: showQuickButtons ? '48px' : '32px',
            '&:hover': { borderColor: '#00A3B4' }
          }),
          singleValue: (base) => ({ ...base, color: '#E2E8F0' }),
          placeholder: (base) => ({ ...base, color: '#94A3B8' }),
          menu: (base) => ({
            ...base,
            backgroundColor: 'rgba(26, 26, 46, 0.95)',
            border: '1px solid rgba(64, 75, 104, 0.3)',
            zIndex: usePortal ? 9999 : 50
          }),
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? '#00A3B4' : 'transparent',
            color: '#E2E8F0',
            '&:hover': { backgroundColor: '#00A3B4' }
          })
        }}
      />
    </div>
  );
}
