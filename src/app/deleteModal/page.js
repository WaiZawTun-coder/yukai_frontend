"use client"; // <--- THIS LINE FIXES THE ERROR

import React, { useState } from 'react';



const DeleteModal = ({ isOpen, onClose, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <div className="icon-container">
            <div className="icon-bg-inner">
              <svg className="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <h3>Delete article</h3>
          <p>Are you sure you want to delete this article? <br /> This action cannot be undone.</p>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-cancel">Cancel</button>
          <button onClick={onDelete} className="btn btn-delete">Delete</button>
        </div>
      </div>
    </div>
  );
};


export default function Page() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button 
        onClick={() => setShowModal(true)}
        style={{ padding: '10px 20px', cursor: 'pointer' }}
      >
        Open Delete Modal
      </button>
      
      <DeleteModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onDelete={() => {
          alert('Delete Successfully!');
          setShowModal(false);
        }}
      />
    </div>
  );
}