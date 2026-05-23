import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import BottomNavigation from '../🎫BottomNavigationCard/BottomNavigation';

// ─────────────────────────────────────────────────────────────────────────────
// 1. GLOBAL THEME CONTEXT LOGIC
// ─────────────────────────────────────────────────────────────────────────────
const themes = {
  light: {
    name: 'Default Light',
    colors: {
      background: '#f0f2f5',
      card: '#ffffff',
      text: '#1c1e21',
      subtleText: '#555',
      primary: '#38BDF8',
      border: '#e0e0e0',
    }
  },
  dark: {
    name: 'Default Dark',
    colors: {
      background: '#0E0E10',
      card: '#1C1C1E',
      text: '#f0f2f5',
      subtleText: '#A1A1A6',
      primary: '#38BDF8',
      border: '#333333',
    }
  },
  lightPink: {
    name: 'Sakura Pink',
    colors: {
      background: '#FFF0F5',
      card: '#FFFFFF',
      text: '#5C3342',
      subtleText: '#8D6E63',
      primary: '#FFB6C1',
      border: '#FFE4E1',
    }
  },
  lightOrange: {
    name: 'Sunset Orange',
    colors: {
      background: '#FFF3E0',
      card: '#FFFFFF',
      text: '#6D4C41',
      subtleText: '#A1887F',
      primary: '#FFB74D',
      border: '#FFE0B2',
    }
  },
  emerald: {
    name: 'Emerald Nature',
    colors: { background: '#ECFDF5', card: '#FFFFFF', text: '#064E3B', subtleText: '#047857', primary: '#10B981', border: '#D1FAE5' }
  },
  sapphire: {
    name: 'Deep Sapphire',
    colors: { background: '#0F172A', card: '#1E293B', text: '#F8FAFC', subtleText: '#94A3B8', primary: '#3B82F6', border: '#334155' }
  },
  amethyst: {
    name: 'Royal Amethyst',
    colors: { background: '#2E1065', card: '#4C1D95', text: '#F5F3FF', subtleText: '#C4B5FD', primary: '#8B5CF6', border: '#5B21B6' }
  },
  skyBlue: {
    name: 'Sky Blue',
    colors: { background: '#F0F9FF', card: '#FFFFFF', text: '#0369A1', subtleText: '#38BDF8', primary: '#0EA5E9', border: '#BAE6FD' }
  },
  monochrome: {
    name: 'Pure Monochrome',
    colors: { background: '#FFFFFF', card: '#F5F5F5', text: '#000000', subtleText: '#666666', primary: '#000000', border: '#E5E5E5' }
  },
  amber: {
    name: 'Golden Amber',
    colors: { background: '#FFFBEB', card: '#FFFFFF', text: '#78350F', subtleText: '#B45309', primary: '#F59E0B', border: '#FEF3C7' }
  },
  teal: {
    name: 'Ocean Teal',
    colors: { background: '#042F2E', card: '#134E4A', text: '#F0FDFA', subtleText: '#5EEAD4', primary: '#14B8A6', border: '#115E59' }
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    colors: { background: '#0D0914', card: '#1A1423', text: '#E2D5F8', subtleText: '#9D8BB0', primary: '#FF00FF', border: '#322544' }
  },
  matcha: {
    name: 'Matcha Green',
    colors: { background: '#F4F7F4', card: '#FFFFFF', text: '#2D3A2D', subtleText: '#7B8C7B', primary: '#86B070', border: '#E3EBE3' }
  },
  volcanic: {
    name: 'Volcanic Ash',
    colors: { background: '#121212', card: '#1E1E1E', text: '#F5F5F5', subtleText: '#888888', primary: '#FF5722', border: '#2C2C2C' }
  },
  nordic: {
    name: 'Nordic Frost',
    colors: { background: '#F0F4F8', card: '#FFFFFF', text: '#102A43', subtleText: '#627D98', primary: '#334E68', border: '#D9E2EC' }
  },
  dracula: {
    name: 'Midnight Dracula',
    colors: { background: '#282A36', card: '#44475A', text: '#F8F8F2', subtleText: '#6272A4', primary: '#BD93F9', border: '#6272A4' }
  },
  sandstone: {
    name: 'Desert Sandstone',
    colors: { background: '#FAF6F0', card: '#FFFFFF', text: '#4A4036', subtleText: '#9E8E7E', primary: '#D4A373', border: '#E8DFD5' }
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeKey, setThemeKey] = useState('light');

  // --- INJECT THEME GLOBALLY ---
  const applyThemeToDocument = (themeObj) => {
    const root = document.documentElement;
    root.style.setProperty('--bg-color', themeObj.colors.background);
    root.style.setProperty('--card-color', themeObj.colors.card);
    root.style.setProperty('--text-color', themeObj.colors.text);
    root.style.setProperty('--subtle-text', themeObj.colors.subtleText);
    root.style.setProperty('--primary-color', themeObj.colors.primary);
    root.style.setProperty('--border-color', themeObj.colors.border);
    document.body.style.backgroundColor = themeObj.colors.background;
    document.body.style.color = themeObj.colors.text;
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'light';
    if (themes[savedTheme]) {
      setThemeKey(savedTheme);
      applyThemeToDocument(themes[savedTheme]);
    }
  }, []);

  const setCurrentTheme = (themeName) => {
    if (themes[themeName]) {
      setThemeKey(themeName);
      localStorage.setItem('app-theme', themeName);
      applyThemeToDocument(themes[themeName]);
    }
  };

  const value = { theme: themes[themeKey], setTheme: setCurrentTheme, availableThemes: themes };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    console.warn("⚠️ ThemeProvider is missing! Please wrap your app in <ThemeProvider> inside App.jsx. Using fallback light theme.");
    return { theme: themes.light, setTheme: () => {}, availableThemes: themes };
  }
  return context;
};


// ─────────────────────────────────────────────────────────────────────────────
// 2. THEME SETTINGS PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function ThemeSettingsPage() {
    const navigate = useNavigate();
    const { theme, setTheme, availableThemes } = useTheme();

    // --- STYLING HELPERS ---
    const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: theme.colors.background, display:'flex', justifyContent:'center', overflowY:'auto', transition: 'background-color 0.3s ease' };
    const subPageCard = { width: '100%', maxWidth: '480px', background: theme.colors.card, padding: '20px', minHeight: '100vh', boxSizing:'border-box', transition: 'background-color 0.3s ease' };
    const backBtn = { background:'none', border:'none', fontSize:'14px', color: theme.colors.subtleText, cursor:'pointer', marginBottom:'20px', padding:0, fontWeight:'600' };
    const sectionTitle = { margin:'0 0 25px 0', color: theme.colors.text, fontSize:'22px', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '15px' };
    const themeGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
    const themeCard = { padding: '20px', borderRadius: '12px', cursor: 'pointer', border: '2px solid transparent', position: 'relative', transition: 'all 0.2s ease-in-out' };
    const activeCheck = { position: 'absolute', top: '10px', right: '10px', color: 'white', background: 'rgba(0,0,0,0.3)', borderRadius: '50%', padding: '2px' };

    return (
        <div style={pageStyle}>
            <div style={subPageCard}>
                <button onClick={() => navigate(-1)} style={backBtn}>⬅ Back</button>
                <h2 style={sectionTitle}>🎨 Theme Settings</h2>
                
                <div style={themeGrid}>
                    {Object.entries(availableThemes).map(([key, themeOption]) => (
                        <div key={key} onClick={() => setTheme(key)} style={{ ...themeCard, background: themeOption.colors.background, borderColor: theme.name === themeOption.name ? themeOption.colors.primary : 'transparent', boxShadow: theme.name === themeOption.name ? `0 0 15px ${themeOption.colors.primary}60` : `0 4px 10px ${themeOption.colors.text}14` }}>
                            {theme.name === themeOption.name && <CheckCircle size={20} style={activeCheck} />}
                            <div style={{ width: '80%', height: '30px', background: themeOption.colors.card, borderRadius: '6px', marginBottom: '10px', border: `1px solid ${themeOption.colors.text}20` }}></div>
                            <div style={{ width: '60%', height: '10px', background: themeOption.colors.primary, borderRadius: '4px' }}></div>
                            <div style={{ marginTop: '15px', color: themeOption.colors.text, fontWeight: '600' }}>{themeOption.name}</div>
                        </div>
                    ))}
                </div>
            </div>
            <BottomNavigation />
        </div>
    );
}

export default ThemeSettingsPage;