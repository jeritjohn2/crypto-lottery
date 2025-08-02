import React, { useState } from 'react';
import Web3 from 'web3';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Contest from './components/Contest';
import Admin from './components/Admin';
import ContestDetail from './components/ContestDetail';
import './styles.css';
import lotteryAbi from './abi/lotteryAbi.json';
import { LOTTERY_ADDRESS } from './constants';

const App = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [web3, setWeb3] = useState(null);
  const [lotteryContract, setLotteryContract] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [userData, setUserData] = useState(null);
  const [userTickets, setUserTickets] = useState([]);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('MetaMask not found. Please install it.');
        return;
      }
      const web3Instance = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      setWeb3(web3Instance);
      setWalletAddress(address);
      const contract = new web3Instance.eth.Contract(lotteryAbi, LOTTERY_ADDRESS);
      setLotteryContract(contract);
      const user = await contract.methods.getUser(address).call();
      console.log('User data:', user);
      if (user.referrer !== '0x0000000000000000000000000000000000000000') {
        setIsRegistered(true);
        setUserData(user);
        const tickets = await contract.methods.getUserTickets(address).call();
        setUserTickets(tickets);
      }
    } catch (error) {
      console.error('MetaMask connection failed:', error);
      alert('Wallet connection failed.');
    }
  };

  const handleBuyTicket = async (referralTicketId) => {
    try {
      if (!referralTicketId || referralTicketId.trim() === "") {
        alert('Referral ticket ID is required.');
        return;
      }
      const referralTicket = await lotteryContract.methods.getTicket(referralTicketId).call();
      if (referralTicket[1] === '0x0000000000000000000000000000000000000000') {
        alert('Referral ticket does not exist.');
        return;
      }
      console.log(`Buying ticket with referral ID: ${referralTicketId}`);
      await lotteryContract.methods.buyTicket(referralTicketId).send({ from: walletAddress });
      alert('🎉 Ticket purchased successfully!');
      const user = await lotteryContract.methods.getUser(walletAddress).call();
      const tickets = await lotteryContract.methods.getUserTickets(walletAddress).call();
      setIsRegistered(user.referrer !== '0x0000000000000000000000000000000000000000');
      setUserData(user);
      setUserTickets(tickets);
    } catch (error) {
      console.error('Transaction error:', error);
      const revertReason = error?.data?.message || error?.data?.originalError?.message || error?.message;
      alert(revertReason || 'Transaction failed');
    }
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-background text-text">
        <Sidebar />
        <div className="flex-grow p-8">
          <Routes>
            <Route path="/" element={
              <Home
                walletAddress={walletAddress}
                connectWallet={connectWallet}
                referralCode={referralCode}
                setReferralCode={setReferralCode}
                handleBuyTicket={handleBuyTicket}
                isRegistered={isRegistered}
                userData={userData}
                userTickets={userTickets}
                web3={web3}
              />
            } />
            <Route path="/contest" element={<Contest />} />
            <Route path="/contest/:id" element={<ContestDetail lotteryContract={lotteryContract} />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;

