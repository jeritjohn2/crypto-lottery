import React, { useState, useEffect } from 'react';
import Tree from 'react-d3-tree';
import Web3 from 'web3';
import { getContracts } from '../utils/contract';
import './custom-tree.css';

const ReferralTree = () => {
  const [treeData, setTreeData] = useState(null);

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  useEffect(() => {
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
    <div className="w-full h-full bg-gray-900 text-white" style={{ height: '100vh' }}>
      {treeData ? (
        <Tree 
          data={treeData} 
          orientation="vertical"
          translate={{ x: 600, y: 200 }}
          nodeSize={{ x: 200, y: 100 }}
          separation={{ siblings: 1.5, nonSiblings: 2 }}
          rootNodeClassName="node__root"
          branchNodeClassName="node__branch"
          leafNodeClassName="node__leaf"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-2xl">Loading referral tree...</p>
        </div>
      )}
    </div>
  );
};

export default ReferralTree;