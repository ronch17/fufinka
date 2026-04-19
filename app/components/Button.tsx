import {forwardRef} from 'react';

/** סגנונות בסיס לאתר — מסגרות עדינות, מעברים רכים, תחושת אטלייה */
const baseStyles =
  'cursor-pointer inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 ease-out ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800/40 focus-visible:ring-offset-2 ' +
  'disabled:pointer-events-none disabled:opacity-45';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  /** מסגרת כפויה + צל קל — מרגיש כמו כרטיס הזמנה לתערוכה */
  | 'artistic'
  /** היפוך: רקע כהה עם טקסט בהיר */
  | 'invert';

export type ButtonSize = 'sm' | 'md' | 'lg';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'border border-neutral-900 bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 hover:shadow ' +
    'active:translate-y-px',
  secondary:
    'border border-neutral-200 bg-stone-50 text-neutral-900 hover:border-neutral-300 hover:bg-stone-100 ' +
    'active:translate-y-px',
  outline:
    'border-2 border-neutral-900 bg-transparent text-neutral-900 hover:bg-neutral-900 hover:text-white ' +
    'active:translate-y-px',
  ghost:
    'border border-transparent bg-transparent text-neutral-800 hover:bg-neutral-100/90 ' +
    'active:bg-neutral-200/80',
  artistic:
    'border border-neutral-900/85 bg-white text-neutral-900 tracking-wide ' +
    'shadow-[3px_3px_0_0_rgba(23,23,23,0.08)] ' +
    'hover:-translate-y-0.5 hover:border-[#eb7025]/70 hover:bg-[#eb702580] hover:text-neutral-900 ' +
    'hover:shadow-[4px_4px_0_0_rgba(235,112,37,0.18)] ' +
    'active:translate-y-0 active:bg-[#eb702570] active:shadow-[2px_2px_0_0_rgba(235,112,37,0.15)]',
  invert:
    'border border-white bg-white text-neutral-900 shadow-sm hover:bg-neutral-100 hover:shadow ' +
    'active:translate-y-px',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-9 rounded-md px-3 py-1.5 text-sm',
  md: 'min-h-11 rounded-md px-5 py-2.5 text-sm md:text-base',
  lg: 'min-h-12 rounded-lg px-7 py-3 text-base md:text-lg',
};

export type ButtonClassNameOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

/**
 * מחזיר מחרוזת class לשימוש ב-`Button`, ב-`<Link>`, או בכל אלמנט.
 */
export function buttonClassName({
  variant = 'primary',
  size = 'md',
  className,
}: ButtonClassNameOptions = {}) {
  return [baseStyles, variantStyles[variant], sizeStyles[size], className]
    .filter(Boolean)
    .join(' ');
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/**
 * כפתור גנרי בסגנון האתר (אומנות / אטלייה).
 *
 * @example
 * <Button variant="artistic">לגלריה</Button>
 * <Button variant="outline" size="sm" className="w-full">שמור</Button>
 *
 * @example עם Link
 * import { Link } from 'react-router';
 * <Link to="/collections" className={buttonClassName({ variant: 'ghost' })}>קולקציות</Link>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {variant = 'primary', size = 'md', className, type = 'button', ...props},
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClassName({variant, size, className})}
      {...props}
    />
  );
});
