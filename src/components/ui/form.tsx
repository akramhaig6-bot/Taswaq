import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'
import { useState } from 'react'
import { Check, Eye, EyeOff, Search } from 'lucide-react'
import { cn, passwordStrength } from '@/lib/utils'

const fieldBase =
  'w-full rounded-xl border bg-white text-sm text-gray-900 placeholder:text-gray-400 transition-colors ' +
  'focus:outline-none disabled:bg-gray-50 disabled:text-gray-500'

function ringClass(error?: string) {
  return error ? 'border-danger focus:border-danger' : 'border-gray-200 focus:border-brand'
}

interface FieldWrapProps {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
  counter?: string
}

export function FieldWrap({ label, error, hint, required, children, counter }: FieldWrapProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 flex items-center gap-1 text-[13px] font-semibold text-gray-700">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}
      {children}
      <div className="mt-1 flex items-start justify-between gap-2">
        {error ? (
          <p className="text-[12px] font-medium text-danger">{error}</p>
        ) : hint ? (
          <p className="text-[12px] text-gray-500">{hint}</p>
        ) : (
          <span />
        )}
        {counter && <span className="text-[11px] text-gray-400">{counter}</span>}
      </div>
    </div>
  )
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  wrapperClassName?: string
}

export function Input({ label, error, hint, icon, className, wrapperClassName, type, ...rest }: InputProps) {
  const [reveal, setReveal] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && reveal ? 'text' : type

  return (
    <FieldWrap label={label} error={error} hint={hint} required={rest.required}>
      <div className={cn('relative', wrapperClassName)}>
        {icon && <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-gray-400">{icon}</span>}
        <input
          {...rest}
          type={inputType}
          className={cn(
            fieldBase,
            ringClass(error),
            'h-11 px-3.5',
            Boolean(icon) && 'ps-10',
            isPassword && 'pe-11',
            className,
          )}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setReveal((v) => !v)}
            className="absolute inset-y-0 end-2 flex w-9 items-center justify-center text-gray-400 hover:text-gray-600"
            aria-label={reveal ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          >
            {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
    </FieldWrap>
  )
}

export function SearchInput({ className, ...rest }: InputProps) {
  return <Input icon={<Search className="size-4" />} className={className} {...rest} />
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  maxLength?: number
}

export function Textarea({ label, error, hint, className, maxLength, value, ...rest }: TextareaProps) {
  const length = typeof value === 'string' ? value.length : 0
  return (
    <FieldWrap
      label={label}
      error={error}
      hint={hint}
      required={rest.required}
      counter={maxLength ? `${length}/${maxLength}` : undefined}
    >
      <textarea
        {...rest}
        value={value}
        maxLength={maxLength}
        className={cn(fieldBase, ringClass(error), 'min-h-24 resize-y p-3.5 leading-7', className)}
      />
    </FieldWrap>
  )
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  placeholder?: string
  options: Array<{ value: string; label: string }>
}

export function Select({ label, error, hint, placeholder, options, className, ...rest }: SelectProps) {
  return (
    <FieldWrap label={label} error={error} hint={hint} required={rest.required}>
      <select {...rest} className={cn(fieldBase, ringClass(error), 'h-11 px-3', className)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrap>
  )
}

export function Checkbox({
  checked,
  onChange,
  label,
  error,
  disabled,
  className,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: ReactNode
  error?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="flex w-full items-start gap-2.5 text-start disabled:opacity-50"
      >
        <span
          className={cn(
            'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-all',
            checked ? 'border-brand bg-brand text-white' : error ? 'border-danger bg-white' : 'border-gray-300 bg-white',
          )}
        >
          {checked && <Check className="size-3.5" strokeWidth={3} />}
        </span>
        {label && <span className="text-[13px] leading-6 text-gray-700">{label}</span>}
      </button>
      {error && <p className="mt-1 text-[12px] font-medium text-danger">{error}</p>}
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
  disabled,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label?: string
  hint?: string
  disabled?: boolean
}) {
  return (
    <label className={cn('flex items-center justify-between gap-3', disabled && 'opacity-50')}>
      {(label || hint) && (
        <span className="min-w-0">
          {label && <span className="block text-[13px] font-semibold text-gray-700">{label}</span>}
          {hint && <span className="block text-[12px] text-gray-500">{hint}</span>}
        </span>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-brand' : 'bg-gray-300',
        )}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={cn(
            'absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all',
            checked ? 'start-[22px]' : 'start-0.5',
          )}
        />
      </button>
    </label>
  )
}

export function RadioGroup<T extends string>({
  value,
  onChange,
  options,
  className,
  direction = 'column',
}: {
  value: T
  onChange: (value: T) => void
  options: Array<{ value: T; label: string; hint?: string; icon?: ReactNode }>
  className?: string
  direction?: 'column' | 'row'
}) {
  return (
    <div className={cn('gap-2', direction === 'row' ? 'flex flex-wrap' : 'flex flex-col', className)}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-center gap-3 rounded-xl border bg-white p-3 text-start transition-all',
              direction === 'row' && 'flex-1',
              active ? 'border-brand bg-brand-soft/60' : 'border-gray-200 hover:border-gray-300',
            )}
          >
            <span
              className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded-full border',
                active ? 'border-brand' : 'border-gray-300',
              )}
            >
              {active && <span className="size-2.5 rounded-full bg-brand" />}
            </span>
            {option.icon}
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-gray-800">{option.label}</span>
              {option.hint && <span className="block text-[12px] text-gray-500">{option.hint}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function PasswordStrengthBar({ value }: { value: string }) {
  const strength = passwordStrength(value)
  const config = {
    weak: { bars: 1, color: 'bg-danger', label: 'ضعيفة' },
    medium: { bars: 2, color: 'bg-warning', label: 'متوسطة' },
    strong: { bars: 3, color: 'bg-success', label: 'قوية' },
  }[strength]

  if (!value) return null
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2].map((index) => (
          <span key={index} className={cn('h-1.5 flex-1 rounded-full', index < config.bars ? config.color : 'bg-gray-200')} />
        ))}
      </div>
      <span className="text-[11px] font-semibold text-gray-500">{config.label}</span>
    </div>
  )
}
