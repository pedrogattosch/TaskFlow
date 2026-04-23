import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary' | 'destructive';

type SharedButtonProps = {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  variant?: ButtonVariant;
};

type ButtonProps = SharedButtonProps & ButtonHTMLAttributes<HTMLButtonElement>;
type ButtonLinkProps = SharedButtonProps &
  Omit<LinkProps, 'className'> &
  AnchorHTMLAttributes<HTMLAnchorElement>;

export function Button({
  children,
  className,
  icon,
  type = 'button',
  variant = 'secondary',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={getButtonClassName({ className, hasIcon: Boolean(icon), variant })}
    >
      {icon ? <span className="ui-button__icon">{icon}</span> : null}
      <span className="ui-button__label">{children}</span>
    </button>
  );
}

export function ButtonLink({
  children,
  className,
  icon,
  variant = 'secondary',
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      {...props}
      className={getButtonClassName({ className, hasIcon: Boolean(icon), variant })}
    >
      {icon ? <span className="ui-button__icon">{icon}</span> : null}
      <span className="ui-button__label">{children}</span>
    </Link>
  );
}

function getButtonClassName({
  className,
  hasIcon,
  variant,
}: {
  className?: string;
  hasIcon: boolean;
  variant: ButtonVariant;
}) {
  return [
    'ui-button',
    `ui-button--${variant}`,
    hasIcon ? 'ui-button--with-icon' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}
