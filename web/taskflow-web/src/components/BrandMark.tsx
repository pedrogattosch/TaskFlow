import taskFlowLogoDark from '../assets/branding/logo_taskflow_dark.svg';
import taskFlowLogoLight from '../assets/branding/logo_taskflow_light.svg';
import { useTheme } from '../contexts/ThemeContext';

type BrandMarkProps = {
  className?: string;
  size?: 'default' | 'compact';
  tagline?: string;
};

export function BrandMark({
  className,
  size = 'default',
  tagline,
}: BrandMarkProps) {
  const { theme } = useTheme();
  const classes = ['brand-mark', size === 'compact' ? 'brand-mark--compact' : '', className]
    .filter(Boolean)
    .join(' ');
  const logoSource = theme === 'dark' ? taskFlowLogoDark : taskFlowLogoLight;

  return (
    <div className={classes}>
      <img className="brand-mark__logo" src={logoSource} alt="TaskFlow" />
      {tagline ? <p className="brand-mark__tagline">{tagline}</p> : null}
    </div>
  );
}
