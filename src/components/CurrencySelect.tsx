'use client';

import Select from 'react-select';
import { CURRENCIES } from '@/lib/constants';

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  showQuickButtons?: boolean;
  compact?: boolean;
  usePortal?: boolean;
}

const QUICK_CURRENCIES = [
  CURRENCIES.find(c => c.value === "USD")!,
  CURRENCIES.find(c => c.value === "ARS")!,
  CURRENCIES.find(c => c.value === "BRL")!,
];

export default function CurrencySelect({ 
  value, 
  onChange, 
  placeholder = "Select currency",
  className = "",
  required = false,
  showQuickButtons = true,
  compact = false,
  usePortal = false
}: CurrencySelectProps) {
  const handleQuickSelect = (currencyValue: string) => {
    onChange(currencyValue);
  };

  const currentCurrency = CURRENCIES.find(currency => currency.value === value);

  return (
    <div className={`
      space-y-3
      ${className}
    `}>
      {showQuickButtons && (
        <div className="flex flex-wrap gap-2">
          {QUICK_CURRENCIES.map((currency) => (
            <button
              key={currency.value}
              type="button"
              onClick={() => handleQuickSelect(currency.value)}
              className={`
                rounded-lg px-3 py-1.5 text-sm font-medium transition-all
                duration-300
                ${
                value === currency.value
                  ? 'bg-wp-primary text-white'
                  : `
                    bg-wp-primary/20 text-wp-primary
                    hover:bg-wp-primary/30
                  `
              }
              `}
            >
              {currency.value}
            </button>
          ))}
        </div>
      )}
      
      <Select
        options={CURRENCIES}
        value={currentCurrency}
        onChange={(selected) => {
          if (selected) {
            onChange(selected.value);
          } else {
            onChange('USD');
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
            minHeight: compact ? '32px' : (showQuickButtons ? '48px' : '32px'),
            fontSize: compact ? '14px' : '16px',
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
