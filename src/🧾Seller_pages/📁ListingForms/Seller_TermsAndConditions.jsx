import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, AlertTriangle } from 'lucide-react';

function Seller_TermsAndConditions() {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100dvh', paddingBottom: '40px' }}>
            
            {/* Header */}
            <div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '20px', paddingBottom: '30px', borderBottomLeftRadius: '25px', borderBottomRightRadius: '25px', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <div onClick={() => navigate(-1)} style={{ cursor: 'pointer', padding: '5px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
                        <ArrowLeft size={24} />
                    </div>
                    <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Legal & Terms</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield size={24} color="#4CAF50" />
                    <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#e2e8f0' }}>Seller Agreement & Liability Waiver</h2>
                </div>
            </div>

            {/* Content Body */}
            <div style={{ padding: '25px 20px', maxWidth: '600px', margin: '0 auto', color: '#334155' }}>
                
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '15px', borderRadius: '12px', marginBottom: '25px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <AlertTriangle size={24} color="#DC2626" style={{ flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: '13px', color: '#991B1B', lineHeight: '1.5', fontWeight: '600' }}>
                        IMPORTANT: Please read carefully. By registering as a Seller on FarmCap, you agree that FarmCap is exclusively a digital bridge connecting you with consumers.
                    </p>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px' }}>
                        1. Platform Role & Scope of Service
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '10px' }}>
                        1.1. <strong>"Bridge" Classification:</strong> FarmCap acts solely as a digital intermediary platform (a "Bridge") that facilitates the discovery of agricultural products, machinery rentals, and labor services between independent sellers and consumers.
                    </p>
                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                        1.2. <strong>No Employment or Partnership:</strong> Registering as a Seller does not create an employer-employee relationship, partnership, joint venture, or agency relationship between you and FarmCap or its developers.
                    </p>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px' }}>
                        2. Zero Liability Clause
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '10px' }}>
                        2.1. <strong>Quality of Goods/Services:</strong> You, the Seller, retain 100% responsibility for the quality, safety, legality, and delivery of any crops, products, machinery, or labor services advertised through FarmCap. The developers and owners of FarmCap bear absolutely zero liability for crop failure, machinery breakdown, or inadequate service provided by you or your laborers.
                    </p>
                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                        2.2. <strong>Financial Transactions:</strong> FarmCap is not responsible for financial disputes, non-payments, delayed payments, or fraudulent activities committed by consumers. All monetary transactions are conducted directly between the Seller and the Consumer at their own risk.
                    </p>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px' }}>
                        3. Labour & Organization Responsibilities
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '10px' }}>
                        3.1. <strong>Labor Contractors:</strong> If you register as an Organisation providing agricultural labor, you are strictly responsible for the safety, wages, and working conditions of the individuals you supply. FarmCap will not be held liable for any workplace injuries, wage disputes, or illegal labor practices.
                    </p>
                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                        3.2. <strong>Machinery Rentals:</strong> Fleet owners are solely responsible for ensuring that rented tractors, drones, or equipment are safe, insured, and operated by licensed individuals if required by local law.
                    </p>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px' }}>
                        4. Indemnification
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                        You agree to indemnify, defend, and hold harmless FarmCap, its founders, developers, and affiliates from any claims, damages, lawsuits, or losses arising from your use of the platform, your interactions with consumers, or your violation of any laws.
                    </p>
                </div>

                <p style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>
                    Last Updated: {new Date().toLocaleDateString()}<br/>
                    These terms are subject to update as the platform evolves.
                </p>

            </div>
        </div>
    );
}

export default Seller_TermsAndConditions;
