import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, XCircle, Info, Trash2, CheckSquare, Square } from 'lucide-react';

function Seller_NotificationsPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        // Load notifications
        const loadedNotifs = JSON.parse(localStorage.getItem('seller_notifications') || '[]');
        setNotifications(loadedNotifs);

        // Mark all as read
        if (loadedNotifs.some(n => !n.isRead)) {
            const markedRead = loadedNotifs.map(n => ({ ...n, isRead: true }));
            localStorage.setItem('seller_notifications', JSON.stringify(markedRead));
            window.dispatchEvent(new Event('seller_notifications_updated'));
        }
    }, []);

    const deleteIndividual = (id) => {
        const updated = notifications.filter(n => n.id !== id);
        setNotifications(updated);
        localStorage.setItem('seller_notifications', JSON.stringify(updated));
        window.dispatchEvent(new Event('seller_notifications_updated'));
    };

    const deleteSelected = () => {
        if(selectedIds.length === 0) return;
        if(window.confirm(`Delete ${selectedIds.length} notifications?`)) {
            const updated = notifications.filter(n => !selectedIds.includes(n.id));
            setNotifications(updated);
            localStorage.setItem('seller_notifications', JSON.stringify(updated));
            window.dispatchEvent(new Event('seller_notifications_updated'));
            setSelectedIds([]);
            setIsSelectionMode(false);
        }
    };

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedIds([]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === notifications.length) {
            setSelectedIds([]); // deselect all
        } else {
            setSelectedIds(notifications.map(n => n.id)); // select all
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const getCardStyles = (type) => {
        switch(type) {
            case 'success': return { bg: '#F0FDF4', border: '#DCFCE7', iconBg: '#DCFCE7', icon: <CheckCircle size={24} color="#16A34A" />, title: '#14532D', text: '#166534', date: '#4ADE80' };
            case 'error': return { bg: '#FEF2F2', border: '#FEE2E2', iconBg: '#FEE2E2', icon: <XCircle size={24} color="#DC2626" />, title: '#7F1D1D', text: '#991B1B', date: '#F87171' };
            case 'info':
            default: return { bg: '#F0F9FF', border: '#E0F2FE', iconBg: '#E0F2FE', icon: <Info size={24} color="#0284C7" />, title: '#0C4A6E', text: '#075985', date: '#7DD3FC' };
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div 
                        onClick={() => navigate(-1)} 
                        style={{ cursor: 'pointer', fontSize: '20px', backgroundColor: '#fff', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                    >
                        ⬅️
                    </div>
                    <h1 style={{ margin: 0, fontSize: '22px', color: '#0f172a', fontWeight: '800' }}>Alerts</h1>
                </div>
                {notifications.length > 0 && !isSelectionMode && (
                    <button onClick={toggleSelectionMode} style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#334155', cursor: 'pointer', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        Select Multiple
                    </button>
                )}
            </div>

            {/* Selection Top Bar */}
            {isSelectionMode && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={toggleSelectAll}>
                        {selectedIds.length === notifications.length ? <CheckSquare size={22} color="#3b82f6" /> : <Square size={22} color="#94a3b8" />}
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>Select All</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={toggleSelectionMode} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                        <button onClick={deleteSelected} disabled={selectedIds.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: selectedIds.length > 0 ? '#ef4444' : '#f1f5f9', color: selectedIds.length > 0 ? '#fff' : '#94a3b8', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed' }}>
                            <Trash2 size={16} /> Delete ({selectedIds.length})
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.length === 0 ? (
                    <div style={{ backgroundColor: '#fff', padding: '40px 20px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <Bell size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                        <h3 style={{ margin: '0 0 8px 0', color: '#334155', fontSize: '18px', fontWeight: '700' }}>No Notifications Yet</h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>You will receive updates about your profile here.</p>
                    </div>
                ) : (
                    notifications.map((notif) => {
                        const style = getCardStyles(notif.type);
                        const isSelected = selectedIds.includes(notif.id);

                        return (
                            <div 
                                key={notif.id} 
                                onClick={() => isSelectionMode && toggleSelect(notif.id)}
                                style={{ 
                                    backgroundColor: style.bg, 
                                    border: `1px solid ${style.border}`, 
                                    padding: '16px', 
                                    borderRadius: '16px', 
                                    display: 'flex', 
                                    gap: '16px', 
                                    alignItems: 'flex-start',
                                    cursor: isSelectionMode ? 'pointer' : 'default',
                                    transition: 'transform 0.1s, opacity 0.2s',
                                    transform: isSelected ? 'scale(0.99)' : 'scale(1)',
                                    opacity: isSelectionMode && !isSelected ? 0.6 : 1
                                }}
                            >
                                {/* Checkbox */}
                                {isSelectionMode && (
                                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                                        {isSelected ? <CheckSquare size={22} color="#3b82f6" /> : <Square size={22} color="#94a3b8" />}
                                    </div>
                                )}

                                <div style={{ marginTop: '2px', backgroundColor: style.iconBg, padding: '10px', borderRadius: '12px' }}>
                                    {style.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                        <h4 style={{ margin: 0, fontSize: '16px', color: style.title, fontWeight: '800' }}>{notif.title}</h4>
                                        <span style={{ fontSize: '11px', color: style.date, fontWeight: '700' }}>
                                            {new Date(notif.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '13px', color: style.text, lineHeight: '1.5', fontWeight: '600' }}>{notif.message}</p>
                                </div>

                                {/* Individual Delete */}
                                {!isSelectionMode && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteIndividual(notif.id); }}
                                        style={{ background: 'none', border: 'none', color: style.date, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
}

export default Seller_NotificationsPage;