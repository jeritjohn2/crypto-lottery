import React, { useState } from 'react';
import Web3 from 'web3';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Contest from './components/Contest';
import Admin from './components/Admin';

import Winners from './components/Winners';
import Payout from './components/Payout';
import Products from './components/Products';
import ReferralTree from './components/ReferralTree';
import './styles.css';
import lotteryAbi from './abi/lotteryAbi.json';
import { LOTTERY_ADDRESS } from './constants';
import { useToast } from './contexts/ToastContext';
import { getContracts } from './utils/contract';

const App = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [web3, setWeb3] = useState(null);
  const [lotteryContract, setLotteryContract] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [userData, setUserData] = useState(null);
  const [userTickets, setUserTickets] = useState([]);
  const { showToast } = useToast();

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        showToast('MetaMask not found. Please install it.', 'error');
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
      showToast('Wallet connected successfully!', 'success');
    } catch (error) {
      console.error('MetaMask connection failed:', error);
      showToast('Wallet connection failed.', 'error');
    }
  };

  const handleBuyTicket = async (referralTicketId) => {
    try {
      if (!referralTicketId || referralTicketId.trim() === "") {
        showToast('Referral ticket ID is required.', 'error');
        return;
      }
      const referralTicket = await lotteryContract.methods.getTicket(referralTicketId).call();
      if (referralTicket[1] === '0x0000000000000000000000000000000000000000') {
        showToast('Referral ticket does not exist.', 'error');
        return;
      }
      console.log(`Buying ticket with referral ID: ${referralTicketId}`);
      showToast('Please approve the transaction in your wallet.', 'info');
      const {contract, usdt} = getContracts(web3);
      //give some usdt to user for testing
      await usdt.methods.mint(walletAddress, web3.utils.toWei('10', 'ether')).send({ from: walletAddress });
      await usdt.methods.approve(LOTTERY_ADDRESS, web3.utils.toWei('10', 'ether')).send({ from: walletAddress })
      const balance = await usdt.methods.balanceOf(walletAddress).call();
      console.log("USDT balance of user:", balance); 
      const sBalance = await usdt.methods.balanceOf("0x79f47536919166CAF62dC932165976539fC05465").call();
      console.log("Product Wallet:", web3.utils.fromWei(sBalance, "ether"), "ETH");


      await lotteryContract.methods.buyTicket(referralTicketId).send({ from: walletAddress });
      showToast('🎉 Ticket purchased successfully!', 'success');
      const user = await lotteryContract.methods.getUser(walletAddress).call();
      const tickets = await lotteryContract.methods.getUserTickets(walletAddress).call();
      setIsRegistered(user.referrer !== '0x0000000000000000000000000000000000000000');
      setUserData(user);
      setUserTickets(tickets);
    } catch (error) {
      console.error('Transaction error:', error);
      const revertReason = error?.data?.message || error?.data?.originalError?.message || error?.message;
      showToast(revertReason || 'Transaction failed', 'error');
    }
  };

  return (
    <Router>
      <div className="flex h-screen bg-background text-text [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]">
        <Sidebar walletAddress={walletAddress} connectWallet={connectWallet} />
        <main className="flex-1 p-8 overflow-y-auto">
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
            <Route path="/admin" element={<Admin walletAddress={walletAddress} />} />
            <Route path="/winners" element={<Winners lotteryContract={lotteryContract} walletAddress={walletAddress} />} />
            <Route path="/payout" element={<Payout walletAddress={walletAddress} />} />
            <Route path="/products" element={<Products walletAddress={walletAddress} userData={userData}/>} />
            <Route path="/referral-tree" element={<ReferralTree walletAddress={walletAddress} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
