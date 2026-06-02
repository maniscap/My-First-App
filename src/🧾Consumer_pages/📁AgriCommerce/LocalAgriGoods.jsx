import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function LocalAgriGoods() {
    const navigate = useNavigate();
    return (
        <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <ArrowLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer', marginRight: '16px', color: '#0f172a' }} />
                <h1 style={{ fontSize: '24px', color: '#0f172a', margin: 0, fontWeight: '800' }}>Local Agri Goods</h1>
            </div>
            <p style={{ color: '#64748b' }}>Products coming soon...</p>
        </div>
    );
}
