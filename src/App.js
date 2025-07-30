import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './styles.css';
import logo from './assets/logo.jpg';
import lotteryAbi from './abi/lotteryAbi.json'; 

const CONTRACT_ADDRESS = '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318';
const USDT_ADDRESS = '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6';

const App = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [web3, setWeb3] = useState(null);
  const [lotteryContract, setLotteryContract] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [userData, setUserData] = useState(null);
  const [userTickets, setUserTickets] = useState([]);
  const [winningTickets, setWinningTickets] = useState([]);

  // NEW state additions
  const [selectedContestType, setSelectedContestType] = useState('0');
  const [selectedRound, setSelectedRound] = useState('0');
  const [fetchedWinners, setFetchedWinners] = useState([]);

  const formatUserId = (id) => {
    if (!id || id === '0') return 'N/A';
    const padded = Number(id).toString().padStart(8, '0');
    return `CL25${padded}A`;
  };

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

      const user = await contract.methods.getUser(address).call();
      if (user.id !== '0') {
        setIsRegistered(true);
        setUserData(user);
        const tickets = await contract.methods.getUserTickets(address).call();
        setUserTickets(tickets);
        fetchWinningTickets(contract);
      }

      //get all users
      const allUsers = await contract.methods.getAllUsers().call();
      //log userdetails and tickets
      allUsers.forEach(async (userAddr, idx) => {
        const userDetails = await contract.methods.getUser(userAddr).call();
        console.log(userDetails);
        const tickets = await contract.methods.getUserTickets(userAddr).call();
        console.log(`User #${idx + 1}:`);
        console.log(`  Address: ${userAddr}`);
        console.log(`  ID: ${userDetails.id}`);
        console.log(`  Earnings: ${web3Instance.utils.fromWei(userDetails.earnings || '0', 'ether')} USDT`);
        console.log(`  Tickets: ${tickets.join(', ') || 'None'}`);
      });


    } catch (error) {
      console.error('MetaMask connection failed:', error);
      alert('Wallet connection failed.');
    }
  };

  const fetchWinningTickets = async (contractInstance = lotteryContract) => {
    try {
      const winners = await contractInstance.methods.getWinningTickets().call();
      setWinningTickets(winners.map(Number));
    } catch (err) {
      console.error("Error fetching winning tickets", err);
    }
  };

  // NEW: fetch winners by contest type and round
  const handleFetchWinners = async () => {
    try {
      const winners = await lotteryContract.methods.getWinners(selectedContestType, selectedRound).call();
      setFetchedWinners(winners.map(w => w.ticketId));
    } catch (err) {
      console.error("Error fetching winners:", err);
      setFetchedWinners([]);
      alert("No winners found for this contest and round.");
    }
  };

  const handleBuyTicket = async (referralTicketId) => {
    try {
      const ticketPrice = web3.utils.toWei('10', 'ether');

      // Referral must be a non-empty ticket ID
      if (!referralTicketId || referralTicketId.trim() === "") {
        alert('Referral ticket ID is required.');
        return;
      }

      // Check that referral ticket exists
      const referralTicket = await lotteryContract.methods.getTicket(referralTicketId).call();
      if (referralTicket[1] === '0x0000000000000000000000000000000000000000') {
        alert('Referral ticket does not exist.');
        return;
      }

      // USDT checks (optional, keep if needed)
      const usdt = new web3.eth.Contract([
        {
          constant: true,
          inputs: [{ name: "_owner", type: "address" }],
          name: "balanceOf",
          outputs: [{ name: "balance", type: "uint256" }],
          type: "function"
        },
        {
          constant: true,
          inputs: [{ name: "_owner", type: "address" }, { name: "_spender", type: "address" }],
          name: "allowance",
          outputs: [{ name: "remaining", type: "uint256" }],
          type: "function"
        },
        {
          constant: false,
          inputs: [{ name: "_spender", type: "address" }, { name: "_value", type: "uint256" }],
          name: "approve",
          outputs: [{ name: "", type: "bool" }],
          type: "function"
        }
      ], USDT_ADDRESS);

      // const balance = await usdt.methods.balanceOf(walletAddress).call();
      // if (parseInt(balance) < parseInt(ticketPrice)) {
      //   alert("Insufficient USDT balance.");
      //   return;
      // }

      // const allowance = await usdt.methods.allowance(walletAddress, CONTRACT_ADDRESS).call();
      // if (parseInt(allowance) < parseInt(ticketPrice)) {
      //   await usdt.methods.approve(CONTRACT_ADDRESS, ticketPrice).send({ from: walletAddress });
      //   alert('USDT approved successfully!');
      // }

      await lotteryContract.methods.buyTicket(referralTicketId).send({ from: walletAddress });
      alert('🎉 Ticket purchased successfully!');

      const user = await lotteryContract.methods.getUser(walletAddress).call();
      const tickets = await lotteryContract.methods.getUserTickets(walletAddress).call();

      setIsRegistered(user.referrer !== '0x0000000000000000000000000000000000000000');
      setUserData(user);
      setUserTickets(tickets);
      fetchWinningTickets();
    } catch (error) {
      console.error('Error buying ticket:', error);
      if (error?.message?.includes('User denied transaction')) {
        alert('User denied the transaction.');
      } else {
        alert('Ticket purchase failed: ' + (error.message || 'Unknown error'));
      }
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
      alert("Error fetching USDT balance.");
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
      alert("Error checking USDT allowance.");
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
      alert("Approval successful!");
    } catch (err) {
      alert("Approval failed.");
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <img src={logo} alt="Crypto Lottery Logo" className="header-logo" />
      </header>

      <div className="container">
        <div className="card">
          <h1 className="title">Crypto Lottery</h1>
          <p className="description">Register and play the blockchain-based lottery game.</p>

          {!walletAddress ? (
            <button className="btn" onClick={connectWallet}>Connect Wallet</button>
          ) : (
            <>
              <p className="wallet-address">Connected: <strong>{walletAddress}</strong></p>
              <button className="btn" onClick={checkUSDTBalance}>Check USDT Balance</button>
              <button className="btn" onClick={checkUSDTAllowance}>Check USDT Allowance</button>
              <button className="btn" onClick={approveUSDT}>Approve USDT</button>
            </>
          )}

          {walletAddress && (
            <div className="referral-box">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter referral wallet address (optional)"
                className="referral-input"
              />
              <button onClick={() => handleBuyTicket(referralCode)} className="buy-ticket-button">
                Buy Ticket with Referral
              </button>
            </div>
          )}

          {walletAddress && isRegistered && userData && (
            <div className="atm-card">
              <p>Wallet: {walletAddress}</p>
              <p>Earnings: {web3.utils.fromWei(userData.earnings || '0', 'ether')} USDT</p>

              <div className="ticket-list">
                <h3>Your Ticket Numbers:</h3>
                {userTickets.length === 0 ? (
                  <p>No tickets yet.</p>
                ) : (
                  <ul>
                    {userTickets.map((ticket, index) => {
                      const isWinner = winningTickets.includes(parseInt(ticket));
                      return (
                        <li key={index}>
                          Ticket #{ticket} {isWinner && <span style={{ color: 'green' }}>🏆 Winner!</span>}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* NEW Block: Contest Type & Round Winner Checker */}
        <div className="card">
          <h3>Check Winners</h3>
          <div>
            <label>Contest Type:</label>
            <select value={selectedContestType} onChange={(e) => setSelectedContestType(e.target.value)}>
              <option value="0">Weekly</option>
              <option value="1">Monthly</option>
              <option value="2">Quarterly</option>
              <option value="3">Half-Yearly</option>
              <option value="4">Grand Prize 1st</option>
              <option value="5">Grand Prize 2nd</option>
              <option value="6">Grand Prize 3rd</option>
              <option value="7">Grand Prize 4th</option>
              <option value="8">Grand Prize 5th</option>
              <option value="9">Grand Prize 6th</option>
            </select>
          </div>
          <div>
            <label>Round:</label>
            <input
              type="number"
              value={selectedRound}
              min="0"
              onChange={(e) => setSelectedRound(e.target.value)}
            />
          </div>
          <button className="btn" onClick={handleFetchWinners}>Fetch Winners</button>

          {fetchedWinners.length > 0 && (
            <div>
              <h4>Winning Tickets (Contest {selectedContestType}, Round {selectedRound})</h4>
              <ul>
                {fetchedWinners.map(tid => (
                  <li key={tid}>Ticket #{tid}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
