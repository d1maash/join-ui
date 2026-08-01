"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface AnimatedFieldProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "size"> {
  /** Visible label. Floats above the value once the field is filled or focused. */
  label: string
  /** Helper text below the field. */
  description?: string
  /** Error message. Sets `aria-invalid` and is announced politely. */
  error?: string
  /** Confirmation message shown when the field is valid. */
  success?: string
  /** Icon rendered at the start of the field. */
  icon?: React.ReactNode
  /** Show a live `value.length / maxLength` counter. */
  showCounter?: boolean
  containerClassName?: string
}

/**
 * A text field whose label floats out of the way and whose underline draws in
 * on focus.
 *
 * Everything the animation implies is also encoded for assistive technology:
 * the label is a real `<label for>`, hints and errors are wired through
 * `aria-describedby`, invalid state sets `aria-invalid`, and the message region
 * is a polite live region so corrections are announced without stealing focus.
 * Works controlled or uncontrolled.
 */
export const AnimatedField = React.forwardRef<HTMLInputElement, AnimatedFieldProps>(
  function AnimatedField(
    {
      label,
      description,
      error,
      success,
      icon,
      showCounter = false,
      maxLength,
      className,
      containerClassName,
      id,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      disabled,
      required,
      placeholder,
      ...props
    },
    forwardedRef
  ) {
    const reactId = React.useId()
    const inputId = id ?? `${reactId}-input`
    const messageId = `${reactId}-message`
    const counterId = `${reactId}-counter`

    const [focused, setFocused] = React.useState(false)
    const [internalValue, setInternalValue] = React.useState(
      String(defaultValue ?? "")
    )
    const currentValue = value !== undefined ? String(value) : internalValue
    const filled = currentValue.length > 0

    const message = error ?? success ?? description
    const tone = error ? "error" : success ? "success" : "neutral"

    const describedBy =
      [message ? messageId : null, showCounter && maxLength ? counterId : null]
        .filter(Boolean)
        .join(" ") || undefined

    return (
      <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
        <div
          data-state={focused ? "focused" : "idle"}
          data-tone={tone}
          className={cn(
            "group relative flex items-center rounded-lg border border-input bg-card",
            "transition-[border-color,background-color] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
            "data-[tone=error]:border-destructive/60 data-[tone=success]:border-success/60",
            "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-60",
            "focus-within:border-border-strong"
          )}
        >
          {icon ? (
            <span
              aria-hidden="true"
              className="pl-3 text-muted-foreground [&_svg]:size-4"
            >
              {icon}
            </span>
          ) : null}

          <div className="relative flex-1">
            <label
              htmlFor={inputId}
              className={cn(
                "pointer-events-none absolute left-3 origin-left text-muted-foreground",
                "transition-[transform,color,font-size] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]",
                filled || focused
                  ? "top-1.5 text-[0.6875rem] font-medium"
                  : "top-1/2 -translate-y-1/2 text-sm",
                focused && "text-foreground",
                tone === "error" && "text-destructive"
              )}
            >
              {label}
              {required ? (
                <span aria-hidden="true" className="ml-0.5 text-destructive">
                  *
                </span>
              ) : null}
            </label>

            <input
              ref={forwardedRef}
              id={inputId}
              value={value}
              defaultValue={value === undefined ? defaultValue : undefined}
              maxLength={maxLength}
              disabled={disabled}
              required={required}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              placeholder={filled || focused ? placeholder : undefined}
              onFocus={(event) => {
                setFocused(true)
                onFocus?.(event)
              }}
              onBlur={(event) => {
                setFocused(false)
                onBlur?.(event)
              }}
              onChange={(event) => {
                if (value === undefined) setInternalValue(event.target.value)
                onChange?.(event)
              }}
              className={cn(
                "h-14 w-full bg-transparent px-3 pb-1.5 pt-6 text-sm text-foreground outline-none",
                "placeholder:text-muted-foreground/70 disabled:cursor-not-allowed",
                className
              )}
              {...props}
            />

            {/* Focus underline, drawn from the centre outward. */}
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-x-0 bottom-0 h-0.5 origin-center scale-x-0 rounded-full bg-primary",
                "transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-soft)]",
                "group-data-[state=focused]:scale-x-100",
                "group-data-[tone=error]:bg-destructive group-data-[tone=success]:bg-success"
              )}
            />
          </div>

          {showCounter && maxLength ? (
            <span
              id={counterId}
              className="shrink-0 pr-3 font-mono text-[0.6875rem] tabular-nums text-muted-foreground"
            >
              {currentValue.length}/{maxLength}
            </span>
          ) : null}
        </div>

        {message ? (
          <p
            id={messageId}
            role={error ? "alert" : undefined}
            aria-live={error ? "assertive" : "polite"}
            className={cn(
              "px-1 text-xs leading-relaxed",
              tone === "error" && "text-destructive",
              tone === "success" && "text-success",
              tone === "neutral" && "text-muted-foreground"
            )}
          >
            {message}
          </p>
        ) : null}
      </div>
    )
  }
)
