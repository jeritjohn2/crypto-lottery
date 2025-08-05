import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { getContracts } from '../utils/contract';
import { useToast } from '../contexts/ToastContext';
import WinnerSelectionDialog from './WinnerSelectionDialog';
import { TransactionTable, TransactionModal } from './TransactionComponents';
import { Ticket, DollarSign, Users, Award, Check, X } from 'lucide-react';

const Admin = () => {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [lotteryContract, setLotteryContract] = useState(null);
  const [ownerTicketGenerated, setOwnerTicketGenerated] = useState(false);
  const [ownerTicketId, setOwnerTicketId] = useState("");
  const [isWinnerSelectionOpen, setIsWinnerSelectionOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('All'); // New state for filter
  const { showToast } = useToast();

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        const { lottery } = getContracts(web3Instance);
        setLotteryContract(lottery);
        const ownerTicketGenerated = await lottery.methods.ownerTicketGenerated().call();
        setOwnerTicketGenerated(ownerTicketGenerated);
        if (ownerTicketGenerated) {
          const ownerTicketId = await lottery.methods.ownerTicketId().call();
          setOwnerTicketId(ownerTicketId);
        }

        // Fetch past events
        const fetchedTransactions = [];

        const allEvents = await lottery.getPastEvents('allEvents', {
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
                user: event.returnValues.winner,
                amount: 'N/A',
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
                  status: 'Processed',
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
    };
    init();
  }, []);

  const handleLogin = () => {
    if (password === 'admin123') {
      setLoggedIn(true);
    } else {
      showToast('Incorrect password', 'error');
    }
  };

  const handleGenerateTicket = async () => {
    if (lotteryContract) {
      try {
        showToast('Please approve the transaction in your wallet.', 'info');
        await lotteryContract.methods.generateOwnerTicket().send({ from: window.ethereum.selectedAddress });
        showToast('Owner ticket generated successfully!', 'success');
        const ownerTicketId = await lotteryContract.methods.ownerTicketId().call();
        setOwnerTicketId(ownerTicketId);
        setOwnerTicketGenerated(true);
      } catch (error) {
        console.error('Error generating owner ticket:', error);
        showToast('Failed to generate owner ticket.', 'error');
      }
    }
  };

  if (!loggedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
          <div className="space-y-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full bg-gray-700 text-white placeholder-gray-500 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-900 text-white">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4">
                <StatCard icon={<Ticket size={28} className="text-blue-500" />} title="Total Tickets Sold" value="10,482" />
                <StatCard icon={<DollarSign size={28} className="text-blue-500" />} title="Total USDT Collected" value="$35,721" />
                <StatCard icon={<Users size={28} className="text-blue-500" />} title="Total Users" value="1,250" />
                <StatCard icon={<Award size={28} className="text-blue-500" />} title="Total Winners" value="128" />
              </div>
            </div>
            <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Admin Actions</h2>
              <div className="space-y-4 flex-grow">
                {ownerTicketGenerated ? (
                  <div>
                    <p className="text-lg">Owner Ticket ID:</p>
                    <p className="p-3 bg-gray-700 rounded-lg font-mono">{ownerTicketId.toString()}</p>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateTicket}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 w-full"
                  >
                    Generate Owner Ticket
                  </button>
                )}
                <button
                  onClick={() => setIsWinnerSelectionOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 w-full"
                >
                  Select Winners
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
            <TransactionTable transactions={transactions} onSelectTransaction={setSelectedTransaction} filterType={filterType} setFilterType={setFilterType} />
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Payout Requests</h2>
            <PayoutRequests />
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">User Stats</h2>
            <UserTable />
          </div>
        </main>
      </div>
      {lotteryContract && (
        <WinnerSelectionDialog
          isOpen={isWinnerSelectionOpen}
          onClose={() => setIsWinnerSelectionOpen(false)}
          lotteryContract={lotteryContract}
        />
      )}
      {selectedTransaction && (
        <TransactionModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
      )}
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div className="bg-gray-800 p-5 rounded-xl shadow-lg flex items-center space-x-4">
    <div className="flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

const PayoutRequests = () => (
  <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between bg-gray-700/50 p-4 rounded-lg">
      <div className="mb-2 sm:mb-0">
        <p className="font-mono">0x1234567890abcdef1234567890abcdef12345678</p>
        <p className="text-sm text-gray-400">150 USDT</p>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-yellow-400 font-semibold">Pending</span>
        <button className="bg-gray-800 p-2 rounded-lg transition duration-300 hover:bg-gray-700">
          <Check size={20} className="text-green-500" strokeWidth={3} />
        </button>
        <button className="bg-gray-800 p-2 rounded-lg transition duration-300 hover:bg-gray-700">
          <X size={20} className="text-red-500" strokeWidth={3} />
        </button>
      </div>
    </div>
  </div>
);

const UserTable = () => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead className="bg-gray-700/50">
                <tr className="border-b border-gray-700">
                    <th className="p-3">Wallet Address</th>
                    <th className="p-3">Ticket ID</th>
                    <th className="p-3">Referrer</th>
                    <th className="p-3">Pairs Matched</th>
                    <th className="p-3">Earnings (USDT)</th>
                </tr>
            </thead>
            <tbody>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="p-3 font-mono">0x1234...cdef</td>
                    <td className="p-3">#54321</td>
                    <td className="p-3 font-mono">0x5678...abcd</td>
                    <td className="p-3 text-center">3</td>
                    <td className="p-3">50.00</td>
                </tr>
                <tr className="bg-gray-800/50 border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="p-3 font-mono">0xabcd...1234</td>
                    <td className="p-3">#98765</td>
                    <td className="p-3 font-mono">N/A</td>
                    <td className="p-3 text-center">4</td>
                    <td className="p-3">250.00</td>
                </tr>
            </tbody>
        </table>
    </div>
);


export default Admin;