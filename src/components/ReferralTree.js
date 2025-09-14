import React, { useState, useEffect, useRef } from 'react';
import Tree from 'react-d3-tree';
import Web3 from 'web3';
import { getContracts } from '../utils/contract';
import './custom-tree.css';

const ReferralTree = () => {
  const [treeData, setTreeData] = useState(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getRewardTypeName = (type) => {
    switch (parseInt(type)) {
      case 1: return "Bluetooth Earbuds + Smartwatch";
      case 2: return "Bluetooth Earbuds + BP Monitoring Machine";
      case 3: return "Bluetooth Earbuds + Nebulizer";
      default: return "None";
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }

    const buildNode = async (lottery, userAddress) => {
      if (userAddress === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      const user = await lottery.methods.users(userAddress).call();
      const userTickets = await lottery.methods.getUserTickets(userAddress).call();

      const node = {
        name: userTickets.length > 0 ? userTickets[0] : 'No Ticket',
        attributes: {
          address: shortenAddress(userAddress),
          claimedReward: getRewardTypeName(user.claimedReward) // Assuming claimedReward is at index 11
        },
        children: [],
      };

      const leftChild = await buildNode(lottery, user.leftChild);
      if (leftChild) {
        node.children.push(leftChild);
      }

      const rightChild = await buildNode(lottery, user.rightChild);
      if (rightChild) {
        node.children.push(rightChild);
      }

      return node;
    };

    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        const { lottery } = getContracts(web3Instance);
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          const tree = await buildNode(lottery, accounts[0]);
          setTreeData([tree]);
        }
      }
    };

    init();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full text-white" style={{ height: 'calc(100vh - 10rem)' }}>
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-text">Your Referral Network</h1>
        <p className="text-gray-400">Visualize your downline and track your growth.</p>
      </div>
      {treeData ? (
        <Tree 
          data={treeData} 
          orientation="vertical"
          translate={{ x: dimensions.width / 2, y: dimensions.height / 5 }}
          nodeSize={{ x: 150, y: 100 }}
          separation={{ siblings: 1.2, nonSiblings: 1.5 }}
          rootNodeClassName="node__root"
          branchNodeClassName="node__branch"
          leafNodeClassName="node__leaf"
        />
      ) : (
        <div className="flex items-center justify-center h-full p-6 rounded-lg shadow-lg backdrop-filter backdrop-blur-lg bg-white/10 border border-white/20">
          <p className="text-2xl">Loading referral tree...</p>
        </div>
      )}
    </div>
  );
};

export default ReferralTree;