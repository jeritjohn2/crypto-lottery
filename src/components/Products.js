import React from 'react';
import mockImage from '../assets/logo.jpg';
import { Gift, Headphones, Watch, HeartPulse } from 'lucide-react';

const Products = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center items-center gap-2">
          <Gift className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Joining Products</h1>
        </div>
        <p className="text-gray-400">Your welcome gift for joining our platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-primary rounded-lg shadow-lg overflow-hidden">
          <img src={mockImage} alt="Bluetooth Earbuds + Smartwatch" className="w-full h-48 object-cover"/>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Headphones className="w-6 h-6" />
              <Watch className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Bluetooth Earbuds + Smartwatch</h2>
            </div>
            <p className="text-gray-400">Enjoy your music and stay connected with this stylish combo.</p>
          </div>
        </div>

        <div className="bg-primary rounded-lg shadow-lg overflow-hidden">
          <img src={mockImage} alt="BP Monitoring Machine" className="w-full h-48 object-cover"/>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <HeartPulse className="w-6 h-6" />
              <h2 className="text-xl font-semibold">BP Monitoring Machine</h2>
            </div>
            <p className="text-gray-400">Keep track of your health with this easy-to-use BP monitor.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
