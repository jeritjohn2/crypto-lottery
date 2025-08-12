import React, { useState, useEffect } from 'react';
import mockImage from '../assets/logo.jpg';
import { Gift, Headphones, Watch, HeartPulse, PlusCircle, CheckCircle } from 'lucide-react';
import Web3 from 'web3';
import { getContracts } from '../utils/contract';
import { useToast } from '../contexts/ToastContext';

const Products = ({ walletAddress, userData }) => {
  const [lotteryContract, setLotteryContract] = useState(null);
  const [claimedReward, setClaimedReward] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        const { lottery } = getContracts(web3Instance);
        setLotteryContract(lottery);

        if (userData && userData[11].toString() !== '0') { // userData[11] is claimedReward
          console.log('User claimed reward:',parseInt(userData[11]));
          
          setClaimedReward(parseInt(userData[11]));
        }
      }
    };
    init();
  }, [walletAddress, userData]);

  const handleClaimReward = async (rewardType) => {
    if (lotteryContract && walletAddress) {
      console.log('Claiming reward:', rewardType);
      try {
        showToast('Please approve the transaction in your wallet.', 'info');
        await lotteryContract.methods.claimReward(rewardType).send({ from: walletAddress });
        showToast('Reward claimed successfully!', 'success');
        setClaimedReward(rewardType);
      } catch (error) {
        console.error('Error claiming reward:', error);
        showToast('Failed to claim reward.', 'error');
      }
    }
  };

  const products = [
    {
      id: 1,
      name: "Bluetooth Earbuds + Smartwatch",
      icon: [<Headphones key="headphones" className="w-6 h-6" />, <Watch key="watch" className="w-6 h-6" />],
      description: "Enjoy your music and stay connected with this stylish combo.",
      rewardType: 1 // Corresponds to BluetoothEarbudsSmartwatch in Solidity enum
    },
    {
      id: 2,
      name: "BP Monitoring Machine",
      icon: [<HeartPulse key="heartpulse" className="w-6 h-6" />],
      description: "Keep track of your health with this easy-to-use BP monitor.",
      rewardType: 2 // Corresponds to BPMonitoringMachine in Solidity enum
    },
    {
      id: 3,
      name: "Nebulizer",
      icon: [<PlusCircle key="pluscircle" className="w-6 h-6" />],
      description: "A portable nebulizer for respiratory health.",
      rewardType: 3 // Corresponds to Nebulizer in Solidity enum
    }
  ];

  const getRewardTypeName = (type) => {
    switch (type) {
      case 1: return "Bluetooth Earbuds + Smartwatch";
      case 2: return "BP Monitoring Machine";
      case 3: return "Nebulizer";
      default: return "None";
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center items-center gap-2">
          <Gift className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Joining Products</h1>
        </div>
        <p className="text-gray-400">Your welcome gift for joining our platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="relative rounded-lg shadow-lg overflow-hidden backdrop-filter backdrop-blur-lg bg-white/10 border border-white/20 p-6 flex flex-col items-center text-center">
            <img src={mockImage} alt={product.name} className="w-full h-48 object-cover rounded-md mb-4"/>
            <div className="flex items-center gap-2 mb-2">
              {product.icon}
              <h2 className="text-xl font-semibold">{product.name}</h2>
            </div>
            <p className="text-gray-400 mb-4 flex-grow">{product.description}</p>
            {claimedReward === 0 ? (
              <button
                onClick={() => handleClaimReward(product.rewardType)}
                className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center w-full"
              >
                <Gift className="mr-2" />
                Claim Reward
              </button>
            ) : (
              <button
                disabled
                className="mt-auto bg-gray-700 text-gray-400 font-bold py-3 px-6 rounded-lg cursor-not-allowed flex items-center justify-center w-full"
              >
                {claimedReward === product.rewardType ? (
                  <><CheckCircle className="mr-2" /> Claimed</>
                ) : (
                  `Claimed: ${getRewardTypeName(claimedReward)}`
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;