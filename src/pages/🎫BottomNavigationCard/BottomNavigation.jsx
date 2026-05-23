import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Bell, ShoppingCart, Menu, Scan, Sprout } from 'lucide-react';

const AnimatedScanIcon = ({ size, strokeWidth }) => (
  <div style={{ 
    position: 'relative', 
    width: '100%', 
    height: '100%', 
    borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, #0f766e, #022c22)',
    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.15), inset 0 -4px 10px rgba(0, 0, 0, 0.6), 0 6px 16px rgba(2, 44, 34, 0.5)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    zIndex: 10
  }}>
    {/* Background 3D Scanner Reticle */}
    <Scan size={size + 8} strokeWidth={1.5} color="rgba(16, 185, 129, 0.3)" style={{ position: 'absolute', zIndex: 1 }} />
    
    {/* Plant Sprout Icon with 3D Drop Shadow */}
    <Sprout size={size} strokeWidth={strokeWidth} color="#e2e8f0" style={{ position: 'relative', zIndex: 2, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />

    {/* Premium 3D Sweeping Laser */}
    <motion.div
      animate={{ top: ['20%', '80%', '20%'] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: 'absolute',
        width: '55%',
        height: '2px',
        background: '#34d399',
        boxShadow: '0 0 10px 2px rgba(52, 211, 153, 0.5)',
        borderRadius: '2px',
        zIndex: 3
      }}
    />
  </div>
);

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

const StyledCartIcon = ({ size, strokeWidth, count }) => (
  <div style={{ position: 'relative', display: 'flex' }}>
    <ShoppingCart size={size} strokeWidth={strokeWidth} />
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

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const allowedPaths = ['/dashboard', '/notifications', '/cart', '/profile', '/more'];
  if (!allowedPaths.includes(location.pathname)) {
    return null;
  }

  const navItems = [
    { label: 'Home', icon: Home, path: '/dashboard', active: location.pathname === '/dashboard', onClick: () => navigate('/dashboard') },
    { label: 'Cart', icon: StyledCartIcon, path: '/cart', count: 0, active: location.pathname === '/cart', onClick: () => navigate('/cart') },
    { label: 'Scan', icon: AnimatedScanIcon, path: '/scanner', active: location.pathname === '/scanner', onClick: () => navigate('/scanner') },
    { label: 'Alerts', icon: NotificationBellIcon, path: '/notifications', count: 0, active: location.pathname === '/notifications', onClick: () => navigate('/notifications') },
    { label: 'More', icon: Menu, path: '/more', active: location.pathname === '/more', onClick: () => navigate('/more') }
  ];

  const activeIndex = navItems.findIndex(item => item.active);

  return (
    <div className="navigation">
      <ul>
        {navItems.map((item, i) => {
          const Icon = item.icon;
          const itemClass = [ 'list', item.label === 'Scan' ? 'scan' : null, item.active ? 'active' : null ].filter(Boolean).join(' ');
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
          height: 70px;
          background: var(--text-color); /* Opposite of the background */
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 -5px 25px rgba(0, 0, 0, 0.05);
          z-index: 1000;
          transition: background-color 0.3s ease;
        }
        
        .navigation ul {
          display: flex;
          width: 90%; /* Creates space on left and right */
          max-width: 380px; /* Pulls icons inwards on larger screens */
          margin: 0 auto;
          padding: 0;
          position: relative;
        }
        
        .navigation ul li {
          list-style: none;
          position: relative;
          width: 20%; 
          height: 70px;
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
        
        /* The Icon Container */
        .navigation ul li a .icon {
          position: relative;
          background: transparent;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          color: var(--bg-color); /* Monochrome contrast */
          opacity: 1; /* Bright when inactive */
          transition: 0.35s ease;
          transition-delay: 0s;
          z-index: 2;
        }

        .navigation ul li.scan a .icon {
          width: 52px;
          height: 52px;
          margin-top: -4px;
        }

        /* Active Icon State */
        .navigation ul li.active a .icon {
          background: var(--text-color); /* Creates the detached floating piece effect */
          color: var(--bg-color);
          opacity: 1;
          transform: translateY(-8px); /* Float cleanly into the valley */
          transition-delay: 0.25s;
        }
        
        /* --- THE MAGIC INDICATOR WRAPPER --- */
        .indicator-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 20%; /* Exactly matches the li width */
          height: 100%;
          display: flex;
          justify-content: center;
          transition: transform 0.5s ease;
          z-index: 1;
          pointer-events: none;
        }
        
        .indicator {
          position: relative;
          width: 70px; /* Fixed width keeps the U-shape valley perfect */
          height: 56px;
          background: var(--bg-color, #121212); /* Cuts a hole to reveal the page background */
          border-radius: 0 0 35px 35px; /* Wide, deep valley bottom */
        }
        
        /* The sweeping concave slope corners */
        .indicator::before {
          content: '';
          position: absolute;
          top: 0px; 
          left: -28px;
          width: 28px;
          height: 28px;
          background: radial-gradient(circle at 0 100%, transparent 27.5px, var(--bg-color, #121212) 28px);
        }
        
        .indicator::after {
          content: '';
          position: absolute;
          top: 0px;
          right: -28px;
          width: 28px;
          height: 28px;
          background: radial-gradient(circle at 100% 100%, transparent 27.5px, var(--bg-color, #121212) 28px);
        }
      `}</style>
    </div>
  );
};

export default BottomNavigation;