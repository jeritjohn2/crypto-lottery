import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { getContracts } from '../utils/contract';
import { TransactionTable, TransactionModal } from './TransactionComponents';

const Home = ({
  walletAddress,
  connectWallet,
  referralCode,
  setReferralCode,
  handleBuyTicket,
  isRegistered,
  userData,
  userTickets,
  web3
}) => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        const { lottery } = getContracts(web3Instance);
        if (walletAddress) {
          const fetchedTransactions = [];

          const allEvents = await lottery.getPastEvents('allEvents', {
            filter: { user: walletAddress },
            fromBlock: 0,
            toBlock: 'latest'
          });

          for (const event of allEvents) {
            const block = await web3Instance.eth.getBlock(event.blockNumber);
            const timestamp = new Date(Number(block.timestamp) * 1000).toLocaleString();

            switch (event.event) {
              case 'TicketPurchased':
                fetchedTransactions.push({
                  type: 'Ticket Purchase',
                  user: event.returnValues.user,
                  amount: `${web3Instance.utils.fromWei(event.returnValues.amount, 'ether')} USDT`,
                  time: timestamp,
                  details: {
                    ticketId: event.returnValues.ticketId,
                    referrer: event.returnValues.referrer,
                  },
                });
                break;
              case 'ReferralCommission':
                fetchedTransactions.push({
                  type: 'Referral Commission',
                  user: event.returnValues.user,
                  amount: `${web3Instance.utils.fromWei(event.returnValues.amount, 'ether')} USDT`,
                  time: timestamp,
                  details: {
                    fromUser: event.returnValues.fromUser,
                    level: event.returnValues.level,
                  },
                });
                break;
              case 'WinnerSelected':
                fetchedTransactions.push({
                  type: 'Winner',
                  user: event.returnValues.user,
                  amount: event.returnValues.amount ? `${web3Instance.utils.fromWei(event.returnValues.amount, 'ether')} USDT` : 'N/A',
                  time: timestamp,
                  details: {
                    ticketId: event.returnValues.ticketId,
                    contestType: event.returnValues.contest,
                  },
                });
                break;
              case 'PayoutProcessed':
                fetchedTransactions.push({
                  type: 'Payout',
                  user: event.returnValues.user,
                  amount: `${web3Instance.utils.fromWei(event.returnValues.amount, 'ether')} USDT`,
                  time: timestamp,
                  details: {
                    serviceFee: `${web3Instance.utils.fromWei(event.returnValues.serviceFee, 'ether')} USDT`,
                    status: event.returnValues.approved ? 'Approved' : 'Rejected',
                  },
                });
                break;
              default:
                break;
            }
          }

          // Sort transactions by time, newest first
          fetchedTransactions.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
          setTransactions(fetchedTransactions);
        }
      }
    };
    init();
  }, [walletAddress]);

  return (
    <div className="space-y-8">
      {!walletAddress && (
        <div className="bg-primary p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <button
            onClick={connectWallet}
            className="w-full bg-accent hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
          >
            Connect Wallet
          </button>
        </div>
      )}

      {walletAddress && userTickets.length === 0 && (
        <div className="bg-primary p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Buy Ticket</h2>
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Enter referral ticket ID (required)"
              className="bg-secondary text-text placeholder-gray-500 p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button onClick={() => handleBuyTicket(referralCode)} className="w-full bg-accent hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
              Buy Ticket with Referral
            </button>
          </div>
        </div>
      )}

      {walletAddress && isRegistered && userData && (
        <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-indigo-900 p-8 rounded-2xl shadow-2xl text-white font-mono max-w-2xl mx-auto transform hover:scale-105 transition-transform duration-300">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-bold tracking-wider">Crypto Lottery</h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-300 opacity-80"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" /></svg>
          </div>
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-1">Your Ticket ID</p>
            <p className="text-4xl font-semibold tracking-widest">{userTickets.length > 0 ? userTickets[0] : 'Not Registered'}</p>
          </div>
          <div className="mb-6">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Wallet Address</p>
            <p className="font-medium text-lg">{walletAddress}</p>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Pairs Matched</p>
              <p className="font-semibold text-base">{userData?.[4]?.toString() || '0'}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Total Earnings</p>
              <p className="font-semibold text-2xl text-green-400">{`${web3.utils.fromWei(userData?.[5] || '0', 'ether')} USDT`}</p>
            </div>
          </div>
        </div>
      )}

      {walletAddress && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
          <TransactionTable transactions={transactions} onSelectTransaction={setSelectedTransaction} />
        </div>
      )}

      {selectedTransaction && (
        <TransactionModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
      )}
    </div>
  );
};
export default Home;
