import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ChevronLeft, Trash2, AlertTriangle, Eraser } from 'lucide-react';

function Seller_DeleteAccount() {
    const navigate = useNavigate();
    const [activeAction, setActiveAction] = useState('none'); // 'none', 'clear', 'delete'
    const [isProcessing, setIsProcessing] = useState(false);

    const wipeSellerData = async (sid) => {
        const collectionsToClear = [
            'listings_farm_fresh', 'listings_machinery', 'listings_workers',
            'listings_business', 'listings_freelancing', 'listings_local_goods'
        ];
        for (const colName of collectionsToClear) {
            const q = query(collection(db, colName), where('sellerId', '==', sid));
            const snap = await getDocs(q);
            const deletePromises = snap.docs.map(d => deleteDoc(doc(db, colName, d.id)));
            await Promise.all(deletePromises);
        }
    };

    const handleClearListings = async () => {
        const activeSellerId = localStorage.getItem('seller_app_id');
        if (!activeSellerId) return;
        
        const confirmText = prompt("Type 'CONFIRM' to clear all your listings.");
        if (confirmText !== 'CONFIRM') return;
        
        setIsProcessing(true);
        try {
            await wipeSellerData(activeSellerId);
            alert("All your listings have been successfully wiped clean!");
            setActiveAction('none');
        } catch (error) {
            console.error(error);
            alert("Failed to clear listings.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteAccount = async () => {
        const activeSellerId = localStorage.getItem('seller_app_id');
        if (!activeSellerId) return;
        
        const confirmText = prompt("Type 'DELETE' to permanently erase your profile and listings.");
        if (confirmText !== 'DELETE') return;
        
        setIsProcessing(true);
        try {
            // 1. Wipe listings automatically
            await wipeSellerData(activeSellerId);
            
            // 2. Delete the profile, storefronts, and application
            await deleteDoc(doc(db, 'seller_profiles', activeSellerId)).catch(e => console.log('Profile wipe skipped:', e));
            
            const accType = localStorage.getItem('seller_account_type');
            if (accType === 'organisation') {
                await deleteDoc(doc(db, 'organisation_storefront', activeSellerId)).catch(e => console.log('Storefront wipe skipped:', e));
            } else if (accType === 'individual') {
                await deleteDoc(doc(db, 'individual_storefront', activeSellerId)).catch(e => console.log('Storefront wipe skipped:', e));
            } else {
                await deleteDoc(doc(db, 'organisation_storefront', activeSellerId)).catch(() => {});
                await deleteDoc(doc(db, 'individual_storefront', activeSellerId)).catch(() => {});
            }
            
            await deleteDoc(doc(db, 'seller_applications', activeSellerId)).catch(e => console.log('Application wipe skipped:', e));
            
            // 3. Clear Local Storage
            localStorage.removeItem('seller_app_id');
            localStorage.removeItem('seller_name');
            localStorage.removeItem('seller_account_type');
            localStorage.removeItem('seller_individual_app_id');
            localStorage.removeItem('seller_organisation_app_id');
            localStorage.removeItem('seller_app_status');
            localStorage.removeItem('seller_app_frozen');
            localStorage.removeItem('seller_app_frozen_reason');
            localStorage.removeItem('cached_reject_ind');
            localStorage.removeItem('cached_reject_org');
            localStorage.removeItem('seller_app_rejected_reason');
            localStorage.removeItem('seller_app_deleted_reason');
            localStorage.removeItem('seller_app_deleted_msg');
            
            alert("Your seller account has been permanently deleted.");
            navigate('/Consumer_HomePage');
        } catch (error) {
            console.error(error);
            alert("Failed to delete account.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#f8fafc', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div onClick={() => navigate(-1)} style={{ cursor: 'pointer', padding: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}>
                    <ChevronLeft size={24} color="#fff" />
                </div>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Manage Account Data</h1>
            </div>

            <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
                
                {activeAction === 'none' && (
                    <>
                        <h2 style={{ fontSize: '16px', color: '#64748b', marginBottom: '20px', lineHeight: '1.5' }}>
                            You can choose to either wipe your shop clean by deleting all listings, or permanently erase your entire seller account.
                        </h2>
                        
                        <div 
                            onClick={() => setActiveAction('clear')}
                            style={{ background: '#fff', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                            <div style={{ background: '#fef9c3', padding: '12px', borderRadius: '12px' }}>
                                <Eraser size={24} color="#ca8a04" />
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 5px', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Clear All Listings</h3>
                                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Wipe your shop clean but keep your seller profile active.</p>
                            </div>
                        </div>

                        <div 
                            onClick={() => setActiveAction('delete')}
                            style={{ background: '#fff', border: '2px solid #fecdd3', borderRadius: '16px', padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(225, 29, 72, 0.05)' }}>
                            <div style={{ background: '#ffe4e6', padding: '12px', borderRadius: '12px' }}>
                                <Trash2 size={24} color="#e11d48" />
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 5px', fontSize: '18px', fontWeight: '800', color: '#be123c' }}>Delete Seller Account</h3>
                                <p style={{ margin: 0, fontSize: '13px', color: '#f43f5e' }}>Permanently erase your profile and all your listings.</p>
                            </div>
                        </div>
                    </>
                )}

                {activeAction === 'clear' && (
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                            <div style={{ background: '#fef9c3', padding: '20px', borderRadius: '50%' }}>
                                <Eraser size={40} color="#ca8a04" />
                            </div>
                        </div>
                        <h2 style={{ textAlign: 'center', margin: '0 0 15px', fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>Clear Your Shop</h2>
                        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #e2e8f0' }}>
                            <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
                                <strong>What happens when you clear your listings?</strong>
                            </p>
                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                                <li>Every single item you have listed across all categories will be instantly deleted.</li>
                                <li>Customers will no longer see any of your products.</li>
                                <li>Your seller profile and business name will <strong>remain active</strong> so you can add new items later.</li>
                            </ul>
                        </div>
                        <button 
                            onClick={handleClearListings}
                            disabled={isProcessing}
                            style={{ width: '100%', background: '#ca8a04', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: '800', fontSize: '16px', border: 'none', cursor: isProcessing ? 'not-allowed' : 'pointer', marginBottom: '15px', opacity: isProcessing ? 0.7 : 1 }}>
                            {isProcessing ? 'Clearing...' : 'Yes, Clear All Listings'}
                        </button>
                        <button 
                            onClick={() => setActiveAction('none')}
                            disabled={isProcessing}
                            style={{ width: '100%', background: 'transparent', color: '#64748b', padding: '16px', borderRadius: '12px', fontWeight: '800', fontSize: '16px', border: 'none', cursor: 'pointer' }}>
                            Cancel
                        </button>
                    </div>
                )}

                {activeAction === 'delete' && (
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 30px rgba(225, 29, 72, 0.15)', border: '2px solid #ffe4e6' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                            <div style={{ background: '#ffe4e6', padding: '20px', borderRadius: '50%' }}>
                                <AlertTriangle size={40} color="#e11d48" />
                            </div>
                        </div>
                        <h2 style={{ textAlign: 'center', margin: '0 0 15px', fontSize: '22px', fontWeight: '800', color: '#be123c' }}>Delete Account</h2>
                        <div style={{ background: '#fff1f2', padding: '15px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #fecdd3' }}>
                            <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#be123c', lineHeight: '1.6' }}>
                                <strong>WARNING: This is permanent.</strong>
                            </p>
                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#f43f5e', lineHeight: '1.6' }}>
                                <li>Your seller profile, business data, and Seller ID will be destroyed.</li>
                                <li><strong>All of your active listings will automatically be deleted.</strong></li>
                                <li>You will be logged out and returned to the consumer homepage.</li>
                                <li>You will have to re-apply from scratch to become a seller again.</li>
                            </ul>
                        </div>
                        <button 
                            onClick={handleDeleteAccount}
                            disabled={isProcessing}
                            style={{ width: '100%', background: '#e11d48', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: '800', fontSize: '16px', border: 'none', cursor: isProcessing ? 'not-allowed' : 'pointer', marginBottom: '15px', opacity: isProcessing ? 0.7 : 1 }}>
                            {isProcessing ? 'Deleting...' : 'Permanently Delete Account'}
                        </button>
                        <button 
                            onClick={() => setActiveAction('none')}
                            disabled={isProcessing}
                            style={{ width: '100%', background: 'transparent', color: '#64748b', padding: '16px', borderRadius: '12px', fontWeight: '800', fontSize: '16px', border: 'none', cursor: 'pointer' }}>
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Seller_DeleteAccount;
