const fs = require('fs');

const content = fs.readFileSync('src/🧾Seller_pages/📁Seller_ListingForms/ManageListings.jsx', 'utf8');
const topPart = content.split('    return (')[0];

const newRender = `    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', overflowY: 'auto', WebkitOverflowScrolling: 'touch', width: '100vw', boxSizing: 'border-box', overflowX: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, sans-serif' }}>
            <style>{\`
                * { box-sizing: border-box; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spin-anim { animation: spin 1s linear infinite; }
                div::-webkit-scrollbar { display: none; }
                
                .clean-card {
                    background: #FFFFFF;
                    border: 1px solid #E5E7EB;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
                    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .clean-card:active {
                    transform: scale(0.98);
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
                }
                .btn-press {
                    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .btn-press:active {
                    transform: scale(0.95);
                }
            \`}</style>
            
            {/* Simple Clean Header */}
            <div style={{ position: 'sticky', top: 0, zIndex: 50, padding: '16px 20px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => navigate(-1)} className="btn-press" style={{ background: 'transparent', border: 'none', padding: '4px', color: '#0066CC', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={24} strokeWidth={2.5} />
                    </button>
                    <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#111827', letterSpacing: '-0.5px' }}>My Listings</h1>
                </div>
                <button 
                    onClick={() => {
                        const sellerAppId = localStorage.getItem('seller_app_id');
                        if (sellerAppId) {
                            setLoading(true);
                            fetchListings(sellerAppId, true);
                        }
                    }}
                    className="btn-press"
                    style={{ background: '#EFF6FF', border: 'none', padding: '8px 14px', borderRadius: '12px', cursor: 'pointer', color: '#0066CC', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', opacity: loading ? 0.7 : 1 }}
                    disabled={loading}
                >
                    <RefreshCw size={16} className={loading ? "spin-anim" : ""} strokeWidth={2.5} /> {loading ? "Syncing" : "Refresh"}
                </button>
            </div>

            {/* Clean Tabs */}
            <div style={{ padding: '20px 20px 10px 20px' }}>
                <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: '10px' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="btn-press"
                            style={{
                                padding: '10px 20px',
                                border: activeTab === tab.id ? '1px solid #0066CC' : '1px solid #E5E7EB',
                                borderRadius: '999px',
                                background: activeTab === tab.id ? '#0066CC' : '#FFFFFF',
                                fontSize: '14px',
                                fontWeight: activeTab === tab.id ? '600' : '500',
                                color: activeTab === tab.id ? '#FFFFFF' : '#4B5563',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                flexShrink: 0,
                                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0, 102, 204, 0.2)' : 'none'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ padding: '10px 20px 40px 20px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B7280', fontWeight: '500', fontSize: '15px' }}>
                        <RefreshCw size={28} className="spin-anim" style={{ color: '#0066CC', marginBottom: '16px' }} />
                        <p>Gathering your items...</p>
                    </div>
                ) : displayListings.length === 0 ? (
                    <div className="clean-card" style={{ textAlign: 'center', padding: '50px 20px', marginTop: '10px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '32px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <PackageOpen size={32} color="#9CA3AF" />
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '18px', fontWeight: '600' }}>No Listings Found</h3>
                        <p style={{ margin: 0, color: '#6B7280', fontSize: '15px', lineHeight: '1.4' }}>You haven't added any {activeTab !== 'all' ? tabs.find(t=>t.id === activeTab).label : ''} items yet.</p>
                        <button onClick={() => navigate('/Seller_HomePage')} className="btn-press" style={{ marginTop: '24px', padding: '14px 28px', background: '#0066CC', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 102, 204, 0.2)' }}>
                            Create Listing
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {displayListings.map(item => (
                            <div key={item.id} className="clean-card" style={{ 
                                padding: '16px', 
                                display: 'flex', 
                                gap: '16px', 
                                alignItems: 'center',
                                width: '100%',
                                overflow: 'hidden'
                            }}>
                                
                                <div style={{ width: '80px', height: '80px', borderRadius: '12px', backgroundColor: '#F3F4F6', overflow: 'hidden', flexShrink: 0, border: '1px solid #E5E7EB' }}>
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '24px' }}>🖼️</div>
                                    )}
                                </div>
                                
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#4B5563', backgroundColor: '#F3F4F6', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '2px 8px', borderRadius: '6px' }}>
                                            {item.listingType.replace('_', ' ')}
                                        </span>
                                        {item.status === 'paused' && (
                                            <span style={{ fontSize: '11px', fontWeight: '600', color: '#DC2626', backgroundColor: '#FEE2E2', padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Power size={10} /> Paused
                                            </span>
                                        )}
                                    </div>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.3px' }}>
                                        {item.itemName}
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '16px', color: '#111827', fontWeight: '600' }}>₹{item.price} <span style={{ color: '#6B7280', fontSize: '14px', fontWeight: '400' }}>/ {item.unit}</span></p>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                                    <button 
                                        onClick={() => handleOpenEdit(item)}
                                        className="btn-press"
                                        style={{ width: '38px', height: '38px', borderRadius: '10px', border: 'none', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#0066CC' }}
                                    >
                                        <Edit2 size={18} strokeWidth={2.5} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id, item.collectionName)}
                                        className="btn-press"
                                        style={{ width: '38px', height: '38px', borderRadius: '10px', border: 'none', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#DC2626' }}
                                    >
                                        <Trash2 size={18} strokeWidth={2.5} />
                                    </button>
                                </div>
                                
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Clean Edit Modal */}
            {editModalOpen && selectedItemForEdit && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    {/* Backdrop */}
                    <div onClick={() => setEditModalOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', animation: 'fadeIn 0.2s ease' }}></div>
                    
                    {/* Sheet */}
                    <div style={{ position: 'relative', backgroundColor: '#FFFFFF', width: '100%', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px 20px 40px 20px', animation: 'slideUpSheet 0.3s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 -10px 40px rgba(0,0,0,0.08)' }}>
                        <style>{\`
                            @keyframes slideUpSheet { from { transform: translateY(100%); } to { transform: translateY(0); } }
                            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        \`}</style>
                        
                        {/* Drag Handle */}
                        <div style={{ width: '40px', height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px', margin: '0 auto 24px auto' }}></div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827', letterSpacing: '-0.3px' }}>Options</h3>
                            <button onClick={() => setEditModalOpen(false)} className="btn-press" style={{ background: '#F3F4F6', border: 'none', borderRadius: '12px', cursor: 'pointer', padding: '8px', display: 'flex', color: '#6B7280' }}>
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button 
                                onClick={handleEditDetails}
                                className="btn-press clean-card"
                                style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textAlign: 'left', border: '1px solid #E5E7EB' }}
                            >
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066CC', flexShrink: 0 }}>
                                    <Edit2 size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>Edit Details</h4>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', fontWeight: '400' }}>Modify price, photos, or text</p>
                                </div>
                            </button>

                            <button 
                                onClick={handleToggleVisibility}
                                className="btn-press clean-card"
                                style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textAlign: 'left', border: '1px solid #E5E7EB' }}
                            >
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: selectedItemForEdit.status === 'paused' ? '#ECFDF5' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedItemForEdit.status === 'paused' ? '#059669' : '#DC2626', flexShrink: 0 }}>
                                    <Power size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: '600', color: selectedItemForEdit.status === 'paused' ? '#059669' : '#DC2626' }}>
                                        {selectedItemForEdit.status === 'paused' ? 'Activate Listing' : 'Pause Listing'}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', fontWeight: '400' }}>
                                        {selectedItemForEdit.status === 'paused' ? 'Make visible to buyers' : 'Hide from the marketplace'}
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
`;

fs.writeFileSync('src/🧾Seller_pages/📁Seller_ListingForms/ManageListings.jsx', topPart + newRender);
