import React, { forwardRef, useEffect, useState } from 'react';

export interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string | number;
  onChange: (value: string) => void;
}

/**
 * Formats a raw numeric string or number into a pt-BR currency string format (e.g. 12,34 or 1.234,56).
 * Automatically shifts entered digits behind decimal marker (0,00 -> 0,01 -> 0,12 -> 1,23 -> 12,34).
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(({
  value,
  onChange,
  className = 'form-input',
  placeholder = '0,00',
  onKeyDown,
  ...props
}, ref) => {
  // Convert standard decimal string/number (e.g. "12.34" or 12.34) to formatted string "12,34"
  const formatFromDecimalString = (val: string | number): string => {
    if (val === '' || val === null || val === undefined) return '';
    const num = typeof val === 'number' ? val : parseFloat(val.toString().replace(',', '.'));
    if (isNaN(num) || num === 0) return '';
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Convert digits string (e.g. "1234") to formatted currency string (e.g. "12,34") and decimal value ("12.34")
  const formatDigits = (digits: string): { display: string; decimal: string } => {
    const cleanDigits = digits.replace(/\D/g, '').replace(/^0+/, '');
    if (!cleanDigits) {
      return { display: '', decimal: '' };
    }
    const padded = cleanDigits.padStart(3, '0'); // e.g. "1" -> "001", "12" -> "012", "123" -> "123"
    const integerPart = padded.slice(0, -2);
    const decimalPart = padded.slice(-2);

    const numInt = parseInt(integerPart, 10);
    const formattedInt = numInt.toLocaleString('pt-BR');
    
    const display = `${formattedInt},${decimalPart}`;
    const decimal = `${numInt}.${decimalPart}`;
    return { display, decimal };
  };

  const [displayValue, setDisplayValue] = useState<string>(() => {
    return formatFromDecimalString(value);
  });

  // Keep displayValue synced with external value updates (e.g. when opening edit modal)
  useEffect(() => {
    setDisplayValue(formatFromDecimalString(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    const digitsOnly = inputVal.replace(/\D/g, '');
    
    // Limit to max 11 digits (up to R$ 99.999.999,99)
    const truncatedDigits = digitsOnly.slice(0, 11);

    const { display, decimal } = formatDigits(truncatedDigits);
    setDisplayValue(display);
    onChange(decimal);
  };

  return (
    <input
      {...props}
      ref={ref}
      type="text"
      inputMode="numeric"
      className={className}
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
      onKeyDown={onKeyDown}
    />
  );
});

CurrencyInput.displayName = 'CurrencyInput';
