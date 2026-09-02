'use client';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'tel' | 'password' | 'number' | 'email';
  className?: string;
  required?: boolean;
  helper?: string;
  error?: string;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
}

export default function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  required,
  helper,
  error,
  multiline,
  rows = 3,
  maxLength,
}: TextFieldProps) {
  const Component = multiline ? 'textarea' : 'input';

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-sm font-medium text-text-secondary">
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>
      <Component
        type={type}
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`input-field resize-none ${
          error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''
        }`}
        required={required}
        maxLength={maxLength}
        {...(multiline ? { rows } : {})}
      />
      {helper && !error && (
        <p className="text-xs text-text-muted">{helper}</p>
      )}
      {error && (
        <p className="text-xs text-danger">{error}</p>
      )}
      {maxLength && (
        <p className="text-xs text-text-muted text-end">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}
