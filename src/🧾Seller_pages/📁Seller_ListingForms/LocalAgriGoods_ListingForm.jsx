import React from 'react';
import LockedListingScreen from '../../🛠️Shared_Components/LockedListingScreen';
import { Store, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function LocalAgriGoods_ListingForm() {
    const navigate = useNavigate();
    const appStatus = localStorage.getItem('seller_app_status') || 'none';

    if (appStatus !== 'approved' && appStatus !== 'loading') {
        return (
            <LockedListingScreen 
                categoryName="Local Goods"
                icon={Store}
                title="Local Goods is Locked"
                description="Showcase your authentic, handcrafted products to a wider audience! Complete your setup to launch your local goods storefront."
                colorTheme={{
                    main: '#E11D48', // Rose/Pink
                    bg: '#FFF1F2',
                    border: '#FECDD3',
                    shadow: '#FDA4AF'
                }}
            />
        );
    }

    return (
        <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <ArrowLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer', marginRight: '16px', color: '#0f172a' }} />
                <h1 style={{ fontSize: '24px', color: '#0f172a', margin: 0, fontWeight: '800' }}>Local Agri Goods</h1>
            </div>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <p style={{ color: '#7f8c8d' }}>Form to add specific local or homemade agricultural products to Firebase will go here.</p>
            </div>
        </div>
    );
}

export default LocalAgriGoods_ListingForm;
