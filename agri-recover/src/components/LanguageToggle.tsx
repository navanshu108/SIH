
import { useLanguage } from '../i18n/LanguageContext';
import { Languages } from 'lucide-react';

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  const handleToggle = () => {
    setLang(lang === 'en' ? 'hi' : 'en');
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={lang === 'en' ? "Switch to Hindi" : "Switch to English"}
      style={{
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        background: 'rgba(255, 255, 255, 0.1)', 
        border: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '8px 14px', 
        borderRadius: '12px', 
        color: 'inherit',
        fontWeight: 700, 
        cursor: 'pointer', 
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
    >
      <Languages size={18} />
      <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
    </button>
  );
}