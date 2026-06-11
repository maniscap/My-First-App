import React from 'react';
import LockedListingScreen from '../../🛠️Shared_Components/LockedListingScreen';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

function Freelancing_ListingForm() {
    const appStatus = localStorage.getItem('seller_app_status') || 'none';
    const storefrontSynced = localStorage.getItem('seller_storefront_synced') === 'true';
    if (appStatus !== 'approved' && appStatus !== 'loading') {
        return (
            <LockedListingScreen 
                categoryName="Freelancing"
                icon={ShieldCheck}
                title="Freelancing is Locked"
                description="Your expertise is in demand! Register as a verified seller to offer your specialized consulting and technical services."
                colorTheme={{
                    main: '#0891B2', // Cyan
                    bg: '#ECFEFF',
                    border: '#CFFAFE',
                    shadow: '#A5F3FC'
                }}
            />
        );
    }

    return (
        <div style={{ padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '100px' }}>
            <h1 style={{ fontSize: '24px', color: '#2c3e50', marginBottom: '20px', fontWeight: '800' }}>Add Freelance Services</h1>
            
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <p style={{ color: '#7f8c8d' }}>Form to add expert consultancy and freelancing services to Firebase will go here.</p>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                {storefrontSynced ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
                        <ShieldCheck size={18} color="#10B981" />
                        <span style={{ fontSize: '13px', color: '#065F46', fontWeight: '700' }}>Store front setup completed 100% and synced to cloud</span>
                    </div>
                ) : (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: 0.9, backgroundColor: '#FEF2F2', padding: '10px 16px', borderRadius: '12px', border: '1px solid #FECACA' }}>
                        <ShieldAlert size={18} color="#DC2626" />
                        <span style={{ fontSize: '13px', color: '#991B1B', fontWeight: '700' }}>Store front details not synced to cloud. Please finish the store front details.</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Freelancing_ListingForm;
