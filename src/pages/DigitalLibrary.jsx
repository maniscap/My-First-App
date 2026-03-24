import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';

const DigitalLibrary = () => {
  const navigate = useNavigate();
  return (
    <div style={{padding: '20px', background: '#e0f2f1', minHeight: '100vh'}}>
      <button onClick={() => navigate('/agri-insights', { state: { explored: true } })} style={{background:'none', border:'none', cursor:'pointer'}}>
        <IoMdArrowBack size={24} color="#00695c"/>
      </button>
      <h1 style={{color: '#00695c', marginTop: '10px'}}>Digital Library 📚</h1>
      <p>Videos and Books collection loading here...</p>
    </div>
  );
};
export default DigitalLibrary;