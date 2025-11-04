// File: src/components/ui/Divider.tsx
// Ini adalah pemisah "atau" dari kode lama Anda
import React from 'react';

const Divider: React.FC = () => {
  return (
    <div className="relative my-2"> {/* (my-6 di kode Anda, saya kurangi) */}
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white px-3 text-gray-500">
          atau
        </span>
      </div>
    </div>
  );
};

export default Divider;
