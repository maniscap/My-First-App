import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';

const NewsUpdates = () => {
  const navigate = useNavigate();
  return (
    <div style={{padding: '20px', background: '#f0f9ff', minHeight: '100vh'}}>
      <button onClick={() => navigate('/agri-insights')} style={{background:'none', border:'none', cursor:'pointer'}}>
        <IoMdArrowBack size={24} color="#0288d1"/>
      </button>
      <h1 style={{color: '#0288d1', marginTop: '10px'}}>Global Agri News 🌍</h1>
      <p>Full News Feed loading here...</p>
    </div>
  );
};
export default NewsUpdates;