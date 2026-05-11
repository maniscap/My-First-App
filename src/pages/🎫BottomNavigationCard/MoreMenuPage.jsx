import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { User, Palette, FileText, Settings } from 'lucide-react';
import { useTheme } from './ThemeSettings';

function MoreMenuPage() {
    const navigate = useNavigate();
    const { theme } = useTheme();

    // --- DYNAMIC STYLING ---
    const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: theme.colors.background, display:'flex', justifyContent:'center', overflowY:'auto', transition: 'background-color 0.3s ease' };
    const subPageCard = { width: '100%', maxWidth: '480px', background: theme.colors.card, padding: '20px', minHeight: '100vh', boxSizing:'border-box', transition: 'background-color 0.3s ease' };
    const sectionTitle = { margin:'0 0 25px 0', color: theme.colors.text, fontSize:'24px', fontWeight: '700', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '15px' };
    const menuListStyle = { listStyle: 'none', padding: 0, margin: 0 };
    const getMenuItemStyle = () => ({ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '15px 10px', 
        borderBottom: `1px solid ${theme.colors.border}`, 
        textDecoration: 'none', 
        color: theme.colors.text, 
        transition: 'background-color 0.2s ease' 
    });
    const menuIconStyle = { marginRight: '15px', color: theme.colors.subtleText };
    const menuTextStyle = { fontSize: '16px', fontWeight: '500' };

    const menuItems = [
        { icon: <Palette style={menuIconStyle} />, text: 'Theme Settings', path: '/settings/theme' },
        { icon: <FileText style={menuIconStyle} />, text: 'Terms & Conditions', path: '/terms' },
        { icon: <Settings style={menuIconStyle} />, text: 'App Settings', path: '/settings' },
    ];

    return (
        <div style={pageStyle}>
            <div style={subPageCard}>
                <h2 style={sectionTitle}>More Options</h2>
                
                <ul style={menuListStyle}>
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <Link to={item.path} style={getMenuItemStyle()} className="menu-item-hover">
                                {item.icon}
                                <span style={menuTextStyle}>{item.text}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            
            <BottomNavigation />
            <style>{`
                .menu-item-hover:hover {
                    background-color: ${theme.colors.background};
                }
            `}</style>
        </div>
    );
}

export default MoreMenuPage;