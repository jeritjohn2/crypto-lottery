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
    <div>
      {!loggedIn ? (
        <div>
          <h2>Admin Login</h2>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter admin password"
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <h2>Admin Panel</h2>
          {/* Admin features go here */}
          {ownerTicketGenerated ? (
            <p>Owner Ticket ID: {ownerTicketId}</p>
          ) : (
            <button onClick={handleGenerateTicket}>Generate Owner Ticket</button>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
