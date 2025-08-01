import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getContracts } from '../utils/contract';

const Admin = () => {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [lotteryContract, setLotteryContract] = useState(null);
  const [ownerTicketGenerated, setOwnerTicketGenerated] = useState(false);
  const [ownerTicketId, setOwnerTicketId] = useState("");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const { lottery } = getContracts(provider);
        setLotteryContract(lottery);
        const ownerTicketGenerated = await lottery.ownerTicketGenerated();
        setOwnerTicketGenerated(ownerTicketGenerated);
        if (ownerTicketGenerated) {
          const ownerTicketId = await lottery.ownerTicketId();
          setOwnerTicketId(ownerTicketId);
        }
      }
    };
    init();
  }, []);

  const handleLogin = () => {
    if (password === 'admin123') {
      setLoggedIn(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleGenerateTicket = async () => {
    if (lotteryContract) {
      try {
        const tx = await lotteryContract.generateOwnerTicket();
        await tx.wait();
        alert('Owner ticket generated successfully!');
        const ownerTicketId = await lotteryContract.ownerTicketId();
        setOwnerTicketId(ownerTicketId);
        setOwnerTicketGenerated(true);
      } catch (error) {
        console.error('Error generating owner ticket:', error);
        alert('Failed to generate owner ticket.');
      }
    }
  };

  return (
    <div className="space-y-8">
      {!loggedIn ? (
        <div className="bg-primary p-8 rounded-lg shadow-lg max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
          <div className="space-y-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full bg-secondary text-text placeholder-gray-500 p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-accent hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
            >
              Login
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-primary p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
          <div className="space-y-4">
            {ownerTicketGenerated ? (
              <div>
                <p className="text-lg">Owner Ticket ID:</p>
                <p className="p-3 bg-secondary rounded-lg font-mono">{ownerTicketId.toString()}</p>
              </div>
            ) : (
              <button
                onClick={handleGenerateTicket}
                className="bg-accent hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
              >
                Generate Owner Ticket
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
