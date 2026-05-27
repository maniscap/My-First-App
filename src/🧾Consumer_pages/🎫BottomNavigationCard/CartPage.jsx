import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../⚙️Settings/ThemeSettings';
import { ShoppingCart } from 'lucide-react';

function CartPage() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    
    // Placeholder state ready to receive items later
    const [cartItems, setCartItems] = useState([]); 

    // --- DYNAMIC STYLING ---
    const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: theme.colors.background, display:'flex', justifyContent:'center', overflowY:'auto', transition: 'background-color 0.3s ease' };
    const subPageCard = { width: '100%', maxWidth: '480px', background: theme.colors.card, padding: '20px', minHeight: '100vh', boxSizing:'border-box', transition: 'background-color 0.3s ease' };
    const backBtn = { background:'none', border:'none', fontSize:'14px', color: theme.colors.subtleText, cursor:'pointer', marginBottom:'20px', padding:0, fontWeight:'600' };
    const sectionTitle = { margin:'0 0 25px 0', color: theme.colors.text, fontSize:'24px', fontWeight: '700', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '15px' };
    const emptyStateContainer = { textAlign: 'center', marginTop: '80px', color: theme.colors.subtleText };
    const shopBtn = { marginTop: '20px', padding: '12px 24px', background: theme.colors.primary, color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', boxShadow: `0 4px 12px ${theme.colors.primary}40` };

    return (
        <div style={pageStyle}>
            <div style={subPageCard}>
                <button onClick={() => navigate(-1)} style={backBtn}>⬅ Back</button>
                <h2 style={sectionTitle}>🛒 Your Cart</h2>
                
                {cartItems.length === 0 ? (
                    <div style={emptyStateContainer}>
                        <ShoppingCart size={64} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
                        <h3 style={{ color: theme.colors.text, marginBottom: '8px' }}>Your cart is empty</h3>
                        <p style={{ fontSize: '14px', marginBottom: '24px' }}>Looks like you haven't added anything yet.</p>
                        <button onClick={() => navigate('/Consumer_HomePage')} style={shopBtn}>
                            Explore Marketplace
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* We will map through cartItems here later */}
                        <p style={{color: theme.colors.text}}>You have {cartItems.length} items in your cart.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CartPage;