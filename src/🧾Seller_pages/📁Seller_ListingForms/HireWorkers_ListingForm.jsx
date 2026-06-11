import React from 'react';
import LockedListingScreen from '../../🛠️Shared_Components/LockedListingScreen';
import { User, ShieldCheck, ShieldAlert } from 'lucide-react';

function HireWorkers_ListingForm() {
    const appStatus = localStorage.getItem('seller_app_status') || 'none';
    const storefrontSynced = localStorage.getItem('seller_storefront_synced') === 'true';
    if (appStatus !== 'approved' && appStatus !== 'loading') {
        return (
            <LockedListingScreen 
                categoryName="Workers"
                icon={User}
                title="Workers is Locked"
                description="Connect with local farms needing your skills. Finalize your profile to list your labor services and get hired instantly."
                colorTheme={{
                    main: '#8B5CF6', // Purple
                    bg: '#F5F3FF',
                    border: '#DDD6FE',
                    shadow: '#C4B5FD'
                }}
            />
        );
    }

    return (
        <div style={{ padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', color: '#2c3e50', marginBottom: '20px', fontWeight: '800' }}>Add Workers/Labor</h1>
            
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <p style={{ color: '#7f8c8d' }}>Form to add daily labor or skilled workers to Firebase will go here.</p>
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

export default HireWorkers_ListingForm;
