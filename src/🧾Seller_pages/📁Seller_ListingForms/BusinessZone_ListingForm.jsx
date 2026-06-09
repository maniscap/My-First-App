import React from 'react';
import LockedListingScreen from '../../🛠️Shared_Components/LockedListingScreen';
import { Building2 } from 'lucide-react';

function BusinessZone_ListingForm() {
    const appStatus = localStorage.getItem('seller_app_status') || 'none';
    if (appStatus !== 'approved' && appStatus !== 'loading') {
        return (
            <LockedListingScreen 
                categoryName="Business Zone"
                icon={Building2}
                title="Business Zone is Locked"
                description="Unlock the power of wholesale! Complete your registration to start securing massive bulk contracts and expanding your business network."
                colorTheme={{
                    main: '#3B82F6', // Blue
                    bg: '#EFF6FF',
                    border: '#DBEAFE',
                    shadow: '#BFDBFE'
                }}
            />
        );
    }

    return (
        <div style={{ padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '100px' }}>
            <h1 style={{ fontSize: '24px', color: '#2c3e50', marginBottom: '20px', fontWeight: '800' }}>Add Wholesale / Business Deal</h1>
            
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <p style={{ color: '#7f8c8d' }}>Form to add B2B bulk contracts to Firebase will go here.</p>
            </div>
        </div>
    );
}

export default BusinessZone_ListingForm;
