import React from 'react';
import LockedListingScreen from '../../🛠️Shared_Components/LockedListingScreen';
import { User } from 'lucide-react';

function HireWorkers_ListingForm() {
    const appStatus = localStorage.getItem('seller_app_status') || 'none';
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
        <div style={{ padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '100px' }}>
            <h1 style={{ fontSize: '24px', color: '#2c3e50', marginBottom: '20px', fontWeight: '800' }}>Add Workers/Labor</h1>
            
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <p style={{ color: '#7f8c8d' }}>Form to add daily labor or skilled workers to Firebase will go here.</p>
            </div>
        </div>
    );
}

export default HireWorkers_ListingForm;
