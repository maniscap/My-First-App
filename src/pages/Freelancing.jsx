import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';

const Freelancing = () => {
  const navigate = useNavigate();
  return (
    <div style={{background: '#111', height: '100vh', color: 'white', padding: '20px'}}>
      <IoMdArrowBack size={28} onClick={() => navigate('/dashboard')} style={{marginBottom: '20px', cursor:'pointer'}}/>
      <h1>Freelancing Hub 🤝</h1>
      <p>Hire Workers or Find Work...</p>
    </div>
  );
};
export default Freelancing;