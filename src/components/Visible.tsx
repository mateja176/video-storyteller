import React from 'react';

export interface VisibleProps {
  visible: boolean;
}

const Visible: React.FC<VisibleProps> = ({ visible, children }) => (
  <div
    style={{
      transition: 'all 0.3s ease-in-out',
      visibility: visible ? 'visible' : 'hidden',
      opacity: visible ? 1 : 0,
    }}
  >
    {children}
  </div>
);

export default Visible;
