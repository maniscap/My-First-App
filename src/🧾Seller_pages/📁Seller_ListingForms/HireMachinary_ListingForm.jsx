import React from 'react';
import LockedListingScreen from '../../🛠️Shared_Components/LockedListingScreen';
import { Truck, ShieldCheck, ShieldAlert } from 'lucide-react';

function HireMachinary_ListingForm() {
    const appStatus = localStorage.getItem('seller_app_status') || 'none';
    const storefrontSynced = localStorage.getItem('seller_storefront_synced') === 'true';
    if (appStatus !== 'approved' && appStatus !== 'loading') {
        return (
            <LockedListingScreen 
                categoryName="Machinery"
                icon={Truck}
                title="Machinery is Locked"
                description="Put your idle equipment to work! Finish your application to start renting out your tractors and machinery to farmers in need."
                colorTheme={{
                    main: '#F59E0B', // Orange
                    bg: '#FFFBEB',
                    border: '#FDE68A',
                    shadow: '#FCD34D'
                }}
            />
        );
    }

    return (
        <div style={{ padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', color: '#2c3e50', marginBottom: '20px', fontWeight: '800' }}>Add Machinery/Tools</h1>
            
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <p style={{ color: '#7f8c8d' }}>Form to add rental machinery or tools to Firebase will go here.</p>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
                {storefrontSynced ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: 0.5 }}>
                        <ShieldCheck size={14} color="#0f172a" />
                        <span style={{ fontSize: '12px', color: '#0f172a', fontWeight: '600', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Storefront Setup 100% Complete</span>
                    </div>
                ) : (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: 0.8, backgroundColor: '#FEF2F2', padding: '8px 14px', borderRadius: '8px', border: '1px solid #FECACA' }}>
                        <ShieldAlert size={14} color="#DC2626" />
                        <span style={{ fontSize: '12px', color: '#991B1B', fontWeight: '600', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Storefront Setup Incomplete</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HireMachinary_ListingForm;
