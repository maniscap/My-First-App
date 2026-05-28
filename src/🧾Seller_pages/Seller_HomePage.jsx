import React from 'react';
import { Link } from 'react-router-dom';

function Seller_HomePage() {
    return (
        <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', padding: '20px' }}>
            
            {/* --- TOP HEADER --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '15px 25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                <h1 style={{ margin: 0, fontSize: '22px', color: '#2c3e50' }}>🛍️ Seller Home</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                    {/* Notifications Button */}
                    <Link to="/seller-notifications" style={{ textDecoration: 'none', position: 'relative', color: '#333' }}>
                        <div style={{ fontSize: '24px', cursor: 'pointer' }}>
                            🔔
                            {/* Optional: Notification badge */}
                            <span style={{ position: 'absolute', top: '-5px', right: '-10px', background: 'red', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px solid white' }}>3</span>
                        </div>
                    </Link>

                    {/* Profile Button routing to Seller Profile */}
                    <Link to="/profile" style={{ textDecoration: 'none' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: '#4CAF50', color: 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', cursor: 'pointer' }}>
                            🧑‍🌾
                        </div>
                </Link>
            </div>
        </div>

            {/* --- HOME WIDGETS --- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#7f8c8d', fontSize: '16px' }}>Active Listings</h3>
                    <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>14</p>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#7f8c8d', fontSize: '16px' }}>Pending Orders</h3>
                    <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#e67e22' }}>5</p>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#7f8c8d', fontSize: '16px' }}>Total Revenue</h3>
                    <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#27ae60' }}>$1,250</p>
                </div>
            </div>

            {/* --- RECENT ACTIVITY --- */}
            <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '18px' }}>Recent Orders</h2>
                <div style={{ padding: '15px', borderBottom: '1px solid #ecf0f1', display: 'flex', justifyContent: 'space-between' }}><span>Order #0012 - 50kg Organic Tomatoes</span><span style={{ color: '#e67e22', fontWeight: 'bold' }}>Pending</span></div>
                <div style={{ padding: '15px', borderBottom: '1px solid #ecf0f1', display: 'flex', justifyContent: 'space-between' }}><span>Order #0011 - 20kg Potatoes</span><span style={{ color: '#27ae60', fontWeight: 'bold' }}>Shipped</span></div>
                <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between' }}><span>Order #0010 - Farm Tractor Rental</span><span style={{ color: '#27ae60', fontWeight: 'bold' }}>Completed</span></div>
            </div>

        </div>
    );
}

export default Seller_HomePage;