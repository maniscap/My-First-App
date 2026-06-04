import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, AlertCircle, X } from 'lucide-react';

function SellerApplication_Terms({ isModal = false, onClose }) {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: '#f8fafc', height: '100dvh', overflowY: 'auto', overflowX: 'hidden', paddingBottom: '40px', width: '100%' }}>
            
            {/* Header */}
            <div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '20px', paddingBottom: '30px', borderBottomLeftRadius: '25px', borderBottomRightRadius: '25px', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {!isModal && (
                            <div onClick={() => navigate(-1)} style={{ cursor: 'pointer', padding: '5px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
                                <ArrowLeft size={24} />
                            </div>
                        )}
                        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Registration Terms</h1>
                    </div>
                    {isModal && (
                        <div onClick={onClose} style={{ cursor: 'pointer', padding: '5px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
                            <X size={24} />
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={24} color="#3b82f6" />
                    <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#e2e8f0' }}>Seller Application Agreement</h2>
                </div>
            </div>

            {/* Content Body */}
            <div style={{ padding: '25px 20px', maxWidth: '600px', margin: '0 auto', color: '#334155' }}>
                
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '15px', borderRadius: '12px', marginBottom: '25px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <AlertCircle size={24} color="#2563eb" style={{ flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: '13px', color: '#1d4ed8', lineHeight: '1.5', fontWeight: '600' }}>
                        IMPORTANT: These terms govern the creation and approval of your Seller Profile. Please read before submitting your application.
                    </p>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px' }}>
                        1. Accuracy of Identity Information
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '10px' }}>
                        1.1. <strong>Truthful Details:</strong> You agree that all information provided during this application (including Name, Aadhar Number, GST Number, and Address) is 100% accurate, truthful, and belongs to you or your legally registered organisation.
                    </p>
                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                        1.2. <strong>Fraudulent Data:</strong> Submitting fake identity documents, incorrect phone numbers, or misleading addresses will result in an immediate and permanent ban from the FarmCap platform.
                    </p>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px' }}>
                        2. Application Review & Approval Discretion
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '10px' }}>
                        2.1. <strong>Right to Reject:</strong> Submitting this application does not guarantee approval. The FarmCap admin team reserves the absolute right to approve, pend, or reject any application without providing a detailed explanation.
                    </p>
                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                        2.2. <strong>Verification Process:</strong> By applying, you grant the FarmCap administrative team the right to manually review your submitted documents and contact you via phone or email to verify your identity before granting access to listing features.
                    </p>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px' }}>
                        3. Legal Compliance
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '10px' }}>
                        3.1. <strong>Local Laws:</strong> You agree to abide by all local agricultural, trade, and labor laws regarding the sale of crops, renting of machinery, or supply of workers.
                    </p>
                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                        3.2. <strong>Account Responsibility:</strong> You are strictly responsible for all activity that occurs under your Seller Profile once approved. Sharing your account credentials or allowing unauthorized individuals to manage your profile is prohibited.
                    </p>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px' }}>
                        4. Data Privacy
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                        Your uploaded documents (such as ID proofs or certificates) are securely stored and will only be used by the FarmCap administration for the purpose of verifying your seller identity. We will not sell your personal identification documents to third parties.
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

export default SellerApplication_Terms;
