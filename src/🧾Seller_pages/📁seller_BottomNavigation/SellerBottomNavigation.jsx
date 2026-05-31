import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, Bell, Settings, Menu } from 'lucide-react';

const NotificationBellIcon = ({ size, strokeWidth, count }) => (
  <div style={{ position: 'relative', display: 'flex' }}>
    <Bell size={size} strokeWidth={strokeWidth} />
    {count > 0 && (
      <div style={{
        position: 'absolute',
        top: '-4px',
        right: '-4px',
        minWidth: '14px',
        height: '14px',
        backgroundColor: '#ef4444',
        color: 'white',
        fontSize: '9px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '7px',
        padding: '0 2px',
      }}>
        {count > 99 ? '99+' : count}
      </div>
    )}
  </div>
);

const MessageIconWithBadge = ({ size, strokeWidth, count }) => (
    <div style={{ position: 'relative', display: 'flex' }}>
      <MessageCircle size={size} strokeWidth={strokeWidth} />
      {count > 0 && (
        <div style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          minWidth: '14px',
          height: '14px',
          backgroundColor: '#3b82f6',
          color: 'white',
          fontSize: '9px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
          padding: '0 2px',
        }}>
          {count > 99 ? '99+' : count}
        </div>
      )}
    </div>
  );

const SellerBottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide navigation on Profile page as requested
  const allowedPaths = ['/Seller_HomePage', '/seller-messages', '/seller-notifications', '/seller-more'];
  if (!allowedPaths.includes(location.pathname)) {
    return null;
  }

  const navItems = [
    { label: 'Home', icon: Home, path: '/Seller_HomePage', active: location.pathname === '/Seller_HomePage', onClick: () => navigate('/Seller_HomePage') },
    { label: 'Messages', icon: MessageIconWithBadge, path: '/seller-messages', count: 0, active: location.pathname === '/seller-messages', onClick: () => navigate('/seller-messages') },
    { label: 'Alerts', icon: NotificationBellIcon, path: '/seller-notifications', count: 0, active: location.pathname === '/seller-notifications', onClick: () => navigate('/seller-notifications') },
    { label: 'Menu', icon: Menu, path: '/seller-more', active: location.pathname === '/seller-more', onClick: () => navigate('/seller-more') }
  ];

  const activeIndex = navItems.findIndex(item => item.active);

  return (
    <div className="navigation">
      <ul>
        {navItems.map((item, i) => {
          const Icon = item.icon;
          const itemClass = [ 'list', item.active ? 'active' : null ].filter(Boolean).join(' ');
          return (
            <li 
              key={i} 
              className={itemClass} 
              onClick={item.onClick}
            >
              <a>
                <span className="icon">
                  <Icon size={24} strokeWidth={2.5} count={item.count} />
                </span>
              </a>
            </li>
          );
        })}
        {activeIndex !== -1 && (
          <div className="indicator-wrapper" style={{ transform: `translateX(${activeIndex * 100}%)` }}>
            <div className="indicator"></div>
          </div>
        )}
      </ul>
      
      <style>{`
        .navigation {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 66px; 
          background: transparent; 
          display: flex;
          justify-content: center;
          align-items: center;
          filter: drop-shadow(0 -5px 25px rgba(0, 0, 0, 0.05)); 
          z-index: 1000;
        }
        
        .navigation ul {
          display: flex;
          width: 90%; 
          max-width: 380px; 
          margin: 0 auto;
          padding: 0;
          position: relative;
        }
        
        .navigation ul li {
          list-style: none;
          position: relative;
          width: 25%; 
          height: 66px;
          z-index: 2;
        }
        
        .navigation ul li a {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          width: 100%;
          text-align: center;
          font-weight: 500;
          height: 100%;
          text-decoration: none;
          color: #555;
          -webkit-tap-highlight-color: transparent;
        }
        
        .navigation ul li a .icon {
          position: relative;
          background: transparent;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          color: var(--bg-color); 
          opacity: 1; 
          transition: 0.35s ease;
          transition-delay: 0s;
          z-index: 2;
        }

        .navigation ul li.active a .icon {
          background: var(--text-color); 
          color: var(--bg-color);
          opacity: 1;
          transform: translateY(-6px); 
          transition-delay: 0.25s;
        }
        
        .indicator-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 25%; 
          height: 100%;
          display: flex;
          justify-content: center;
          transition: transform 0.5s ease;
          z-index: 1;
          pointer-events: none;
        }
        
        .indicator {
          position: relative;
          width: 68px; 
          height: 66px; 
          
          background-image: 
            linear-gradient(to right, var(--text-color), var(--text-color)),
            radial-gradient(circle at 50% 0%, transparent 33.5px, var(--text-color) 34px);
          background-position: 
            0 56px,
            0 21px; 
          background-size: 
            68px 11px, 
            68px 36px; 
          background-repeat: no-repeat;
        }
        
        .indicator::before {
          content: '';
          position: absolute;
          top: 0px; 
          right: calc(100% - 1px); 
          width: 100vw;
          height: 66px;
          background: var(--text-color);
          border-top-right-radius: 27px; 
        }
        
        .indicator::after {
          content: '';
          position: absolute;
          top: 0px;
          left: calc(100% - 1px); 
          width: 100vw;
          height: 66px;
          background: var(--text-color);
          border-top-left-radius: 27px; 
        }
      `}</style>
    </div>
  );
};

export default SellerBottomNavigation;
