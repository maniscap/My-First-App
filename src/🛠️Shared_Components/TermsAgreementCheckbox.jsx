import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function TermsAgreementCheckbox({ checked, onChange }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', transition: 'all 0.3s ease' }}>
                <input 
                    type="checkbox" 
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: '#0f172a', cursor: 'pointer' }}
                    required
                />
                <span style={{ fontSize: '14px', color: '#334155', fontWeight: '600', userSelect: 'none' }}>
                    I have read and agree to the <span 
                        onClick={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation(); 
                            setIsModalOpen(true); 
                        }} 
                        style={{ color: '#2563eb', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                        Terms & Conditions
                    </span>
                </span>
            </label>

            {/* Glassmorphic Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setIsModalOpen(false)}>
                    
                    {/* Modal Content */}
                    <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '500px', maxHeight: '85vh', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', animation: 'modalSlideUp 0.3s ease-out' }} onClick={(e) => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ShieldCheck size={24} color="#16a34a" />
                                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Platform Standards</h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, color: '#334155' }}>
                            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <AlertTriangle size={24} color="#DC2626" style={{ flexShrink: 0 }} />
                                <p style={{ margin: 0, fontSize: '13px', color: '#991B1B', lineHeight: '1.5', fontWeight: '600' }}>
                                    IMPORTANT: Please read carefully. By registering as a Seller on FarmCap, you agree that FarmCap is exclusively a digital bridge connecting you with consumers.
                                </p>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ backgroundColor: '#e2e8f0', color: '#475569', borderRadius: '4px', padding: '2px 6px', fontSize: '11px' }}>01</span>
                                    Platform Role & Scope of Service
                                </h3>
                                <p style={{ fontSize: '13.5px', lineHeight: '1.6', margin: '0 0 8px' }}>
                                    <strong>"Bridge" Classification:</strong> FarmCap acts solely as a digital intermediary platform (a "Bridge") that facilitates the discovery of agricultural products, machinery rentals, and labor services between independent sellers and consumers.
                                </p>
                                <p style={{ fontSize: '13.5px', lineHeight: '1.6', margin: 0 }}>
                                    <strong>No Employment or Partnership:</strong> Registering as a Seller does not create an employer-employee relationship, partnership, joint venture, or agency relationship between you and FarmCap or its developers.
                                </p>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ backgroundColor: '#e2e8f0', color: '#475569', borderRadius: '4px', padding: '2px 6px', fontSize: '11px' }}>02</span>
                                    Zero Liability Clause
                                </h3>
                                <p style={{ fontSize: '13.5px', lineHeight: '1.6', margin: '0 0 8px' }}>
                                    <strong>Quality of Goods/Services:</strong> You, the Seller, retain 100% responsibility for the quality, safety, legality, and delivery of any crops, products, machinery, or labor services advertised through FarmCap. The developers and owners of FarmCap bear absolutely zero liability for crop failure, machinery breakdown, or inadequate service provided by you or your laborers.
                                </p>
                                <p style={{ fontSize: '13.5px', lineHeight: '1.6', margin: 0 }}>
                                    <strong>Financial Transactions:</strong> FarmCap is not responsible for financial disputes, non-payments, delayed payments, or fraudulent activities committed by consumers. All monetary transactions are conducted directly between the Seller and the Consumer at their own risk.
                                </p>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ backgroundColor: '#e2e8f0', color: '#475569', borderRadius: '4px', padding: '2px 6px', fontSize: '11px' }}>03</span>
                                    Labour & Organization Responsibilities
                                </h3>
                                <p style={{ fontSize: '13.5px', lineHeight: '1.6', margin: '0 0 8px' }}>
                                    <strong>Labor Contractors:</strong> If you register as an Organisation providing agricultural labor, you are strictly responsible for the safety, wages, and working conditions of the individuals you supply. FarmCap will not be held liable for any workplace injuries, wage disputes, or illegal labor practices.
                                </p>
                                <p style={{ fontSize: '13.5px', lineHeight: '1.6', margin: 0 }}>
                                    <strong>Machinery Rentals:</strong> Fleet owners are solely responsible for ensuring that rented tractors, drones, or equipment are safe, insured, and operated by licensed individuals if required by local law.
                                </p>
                            </div>

                            <div style={{ marginBottom: '8px' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ backgroundColor: '#e2e8f0', color: '#475569', borderRadius: '4px', padding: '2px 6px', fontSize: '11px' }}>04</span>
                                    Indemnification
                                </h3>
                                <p style={{ fontSize: '13.5px', lineHeight: '1.6', margin: 0 }}>
                                    You agree to indemnify, defend, and hold harmless FarmCap, its founders, developers, and affiliates from any claims, damages, lawsuits, or losses arising from your use of the platform, your interactions with consumers, or your violation of any laws.
                                </p>
                            </div>
                        </div>

                        {/* Footer Button */}
                        <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9' }}>
                            <button 
                                onClick={() => {
                                    onChange(true); // Automatically check the box for them
                                    setIsModalOpen(false);
                                }}
                                style={{ width: '100%', padding: '16px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)' }}
                            >
                                I Understand & Agree
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
