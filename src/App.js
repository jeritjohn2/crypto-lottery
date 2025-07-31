import React, { useState } from 'react';
import Web3 from 'web3';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Contest from './components/Contest';
import Admin from './components/Admin';
import './styles.css';
import lotteryAbi from './abi/lotteryAbi.json';

const CONTRACT_ADDRESS = '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853';
const USDT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const App = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [web3, setWeb3] = useState(null);
  const [lotteryContract, setLotteryContract] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [userData, setUserData] = useState(null);
  const [userTickets, setUserTickets] = useState([]);
  const [winningTickets, setWinningTickets] = useState([]);
  const [selectedContestType, setSelectedContestType] = useState('0');
  const [selectedRound, setSelectedRound] = useState('0');
  const [fetchedWinners, setFetchedWinners] = useState([]);

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
      const contract = new web3Instance.eth.Contract(lotteryAbi, CONTRACT_ADDRESS);
      setLotteryContract(contract);
      console.log('Available contract methods:', Object.keys(contract.methods));
      const user = await contract.methods.getUser(address).call();
      if (user.referrer !== '0x0000000000000000000000000000000000000000') {
        setIsRegistered(true);
        setUserData(user);
        const tickets = await contract.methods.getUserTickets(address).call();
        setUserTickets(tickets);
        //fetchWinningTickets(contract);
      }
    } catch (error) {
      console.error('MetaMask connection failed:', error);
      alert('Wallet connection failed.');
    }
  };

  // const fetchWinningTickets = async (contractInstance = lotteryContract) => {
  //   // try {
  //   //   const winners = await contractInstance.methods.getWinningTickets().call();
  //   //   setWinningTickets(winners.map(Number));
  //   // } catch (err) {
  //   //   console.error('Error fetching winning tickets', err);
  //   // }
  // };

  const handleFetchWinners = async () => {
    try {
      const winners = await lotteryContract.methods.getWinners(selectedContestType, selectedRound).call();
      setFetchedWinners(winners.map(w => w.ticketId));
    } catch (err) {
      console.error('Error fetching winners:', err);
      setFetchedWinners([]);
      alert('No winners found for this contest and round.');
    }
  };

  const handleBuyTicket = async (referralTicketId) => {
    try {
      const ticketPrice = web3.utils.toWei('10', 'ether');
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
      // fetchWinningTickets();
    } catch (error) {
      console.error('Transaction error:', error);
      const revertReason = error?.data?.message || error?.data?.originalError?.message || error?.message;
      alert(revertReason || 'Transaction failed');
    }
  };

  const checkUSDTBalance = async () => {
    try {
      const usdt = new web3.eth.Contract([
        {
          constant: true,
          inputs: [{ name: "_owner", type: "address" }],
          name: "balanceOf",
          outputs: [{ name: "balance", type: "uint256" }],
          type: "function"
        }
      ], USDT_ADDRESS);
      const balance = await usdt.methods.balanceOf(walletAddress).call();
      alert(`USDT Balance: ${web3.utils.fromWei(balance, 'ether')} USDT`);
    } catch (err) {
      alert('Error fetching USDT balance.');
      console.error(err);
    }
  };

  const checkUSDTAllowance = async () => {
    try {
      const usdt = new web3.eth.Contract([
        {
          constant: true,
          inputs: [{ name: "_owner", type: "address" }, { name: "_spender", type: "address" }],
          name: "allowance",
          outputs: [{ name: "remaining", type: "uint256" }],
          type: "function"
        }
      ], USDT_ADDRESS);
      const allowance = await usdt.methods.allowance(walletAddress, CONTRACT_ADDRESS).call();
      alert(`USDT Allowance: ${web3.utils.fromWei(allowance, 'ether')} USDT`);
    } catch (err) {
      alert('Error checking USDT allowance.');
      console.error(err);
    }
  };

  const approveUSDT = async () => {
    try {
      const ticketPrice = web3.utils.toWei('10', 'ether');
      const usdt = new web3.eth.Contract([
        {
          constant: false,
          inputs: [{ name: "_spender", type: "address" }, { name: "_value", type: "uint256" }],
          name: "approve",
          outputs: [{ name: "", type: "bool" }],
          type: "function"
        }
      ], USDT_ADDRESS);
      await usdt.methods.approve(CONTRACT_ADDRESS, ticketPrice).send({ from: walletAddress });
      alert('Approval successful!');
    } catch (err) {
      alert('Approval failed.');
      console.error(err);
    }
  };

  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={
              <Home
                walletAddress={walletAddress}
                connectWallet={connectWallet}
                checkUSDTBalance={checkUSDTBalance}
                checkUSDTAllowance={checkUSDTAllowance}
                approveUSDT={approveUSDT}
                referralCode={referralCode}
                setReferralCode={setReferralCode}
                handleBuyTicket={handleBuyTicket}
                isRegistered={isRegistered}
                userData={userData}
                userTickets={userTickets}
                winningTickets={winningTickets}
                web3={web3}
              />
            } />
            <Route path="/contest" element={
              <Contest
                selectedContestType={selectedContestType}
                setSelectedContestType={setSelectedContestType}
                selectedRound={selectedRound}
                setSelectedRound={setSelectedRound}
                handleFetchWinners={handleFetchWinners}
                fetchedWinners={fetchedWinners}
              />
            } />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;

