import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-neutral-200 bg-white py-3 text-center text-xs text-neutral-500">
      <p>© {new Date().getFullYear()} DentalCare Clinic Management System. All rights reserved.</p>
    </footer>
  );
};

export default Footer;