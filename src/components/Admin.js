import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { getContracts } from '../utils/contract';
import { useToast } from '../contexts/ToastContext';
import WinnerSelectionDialog from './WinnerSelectionDialog';
import { TransactionTable, TransactionModal } from './TransactionComponents';
import { Ticket, DollarSign, Users, Award, Check, X, ChevronLeft, ChevronRight, Clipboard } from 'lucide-react';


const Admin = () => {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [lotteryContract, setLotteryContract] = useState(null);
  const [usdtContract, setUsdtContract] = useState(null);
  const [ownerTicketGenerated, setOwnerTicketGenerated] = useState(false);
  const [ownerTicketId, setOwnerTicketId] = useState("");
  const [isWinnerSelectionOpen, setIsWinnerSelectionOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('All'); // New state for filter
  const [users, setUsers] = useState([]); // New state for users
  const [totalTicketsSold, setTotalTicketsSold] = useState(0);
  const [totalUSDTCollected, setTotalUSDTCollected] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalWinners, setTotalWinners] = useState(0);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [copiedOwnerTicketId, setCopiedOwnerTicketId] = useState(false);
  const handleCopyOwnerTicketId = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedOwnerTicketId(true);
    setTimeout(() => setCopiedOwnerTicketId(false), 2000); // Reset after 2 seconds
  };

  const { showToast } = useToast();

  const getRewardTypeName = (type) => {
    switch (parseInt(type)) {
      case 1: return "Bluetooth Earbuds + Smartwatch";
      case 2: return "Bluetooth Earbuds + BP Monitoring Machine";
      case 3: return "Bluetooth Earbuds + Nebulizer";
      default: return "None";
    }
  };

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        const { lottery, usdt } = getContracts(web3Instance);
        setLotteryContract(lottery);
        setUsdtContract(usdt);
        console.log();
        const ownerTicketGenerated = await lottery.methods.ownerTicketGenerated().call();
        setOwnerTicketGenerated(ownerTicketGenerated);
        if (ownerTicketGenerated) {
          const ownerTicketId = await lottery.methods.ownerTicketId().call();
          setOwnerTicketId(ownerTicketId);
        }

        const requests = await lottery.methods.getAllPayoutRequests().call();
        setPayoutRequests(requests);
        // Fetch past events and user data
        const fetchedTransactions = [];
        const uniqueUsers = new Set();
        let ticketsSold = 0;
                let usdtCollected =web3Instance.utils.toBigInt("0"); // Initialize as BigNumber
        let winnersCount = 0;

        const allEvents = await lottery.getPastEvents('allEvents', {
          fromBlock: 0,
          toBlock: 'latest'
        });

        for (const event of allEvents) {
          const block = await web3Instance.eth.getBlock(event.blockNumber);
          const timestamp = new Date(Number(block.timestamp) * 1000).toLocaleString();

          switch (event.event) {
            case 'TicketPurchased':
              ticketsSold++;
              usdtCollected += web3Instance.utils.toBigInt(event.returnValues.amount);
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
              uniqueUsers.add(event.returnValues.user);
              uniqueUsers.add(event.returnValues.referrer);
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
              uniqueUsers.add(event.returnValues.user);
              uniqueUsers.add(event.returnValues.fromUser);
              break;
            case 'WinnerSelected':
              winnersCount++;
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
              uniqueUsers.add(event.returnValues.winner);
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
              uniqueUsers.add(event.returnValues.user);
              break;
            case 'PairMatchingReward':
              fetchedTransactions.push({
                type: 'Pair Matching Reward',
                user: event.returnValues.user,
                amount: `${web3Instance.utils.fromWei(event.returnValues.amount, 'ether')} USDT`,
                time: timestamp,
                details: {
                  pairs: event.returnValues.pairs,
                },
              });
              uniqueUsers.add(event.returnValues.user);
              break;
            case 'RewardClaimed':
              fetchedTransactions.push({
                type: 'Reward Claimed',
                user: event.returnValues.user,
                amount: 'N/A',
                time: timestamp,
                details: {
                  rewardType: getRewardTypeName(event.returnValues.rewardType),
                  referrer: event.returnValues.referrer ? event.returnValues.referrer : 'N/A',  
                },
              });
              uniqueUsers.add(event.returnValues.user);
              break;
            default:
              break;
          }
        }

        // Fetch user data for unique users
        const fetchedUsers = [];
        for (const userAddress of Array.from(uniqueUsers)) {
          try {
            const userData = await lottery.methods.getUser(userAddress).call();
            fetchedUsers.push({
              address: userAddress,
              referrer: userData[0],
              pairsMatched: userData[4],
              prizeEarnings: web3Instance.utils.fromWei(userData[5], 'ether'),
              referralEarnings: web3Instance.utils.fromWei(userData[6], 'ether'),
              claimedReward: getRewardTypeName(userData[12])
            });
          } catch (error) {
            console.error(`Error fetching data for user ${userAddress}:`, error);
          }
        }

        // Sort transactions by time, newest first
        fetchedTransactions.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setTransactions(fetchedTransactions);
        setUsers(fetchedUsers);
        setTotalTicketsSold(ticketsSold);
        setTotalUSDTCollected(web3Instance.utils.fromWei(usdtCollected, 'ether'));
        setTotalUsers(uniqueUsers.size);
        setTotalWinners(winnersCount);
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

  const handleProcessPayout = async (requestId, approve) => {
    if (lotteryContract) {
      try {
        showToast('Please approve the transaction in your wallet.', 'info');
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const amountToApprove = parseInt(payoutRequests[requestId].amount) + parseInt(payoutRequests[requestId].serviceFee);
        await usdtContract.methods.approve(lotteryContract._address, amountToApprove).send({ from: accounts[0] });
        await lotteryContract.methods.processPayout(requestId, approve).send({ from: accounts[0] });
        showToast('Payout processed successfully!', 'success');
        const requests = await lotteryContract.methods.getAllPayoutRequests().call();
        setPayoutRequests(requests);
      } catch (error) {
        console.error('Error processing payout:', error);
        showToast('Failed to process payout.', 'error');
      }
    }
  };

  const handleGenerateTicket = async () => {
    if (lotteryContract) {
      try {
        showToast('Please approve the transaction in your wallet.', 'info');
        const estimatedGas = await lotteryContract.methods.generateOwnerTicket().estimateGas({ from: window.ethereum.selectedAddress });
        console.log('Estimated gas:', estimatedGas);

        await lotteryContract.methods.generateOwnerTicket().send({ from: window.ethereum.selectedAddress,gas: parseInt(estimatedGas)+5000
         });
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
      <div className="flex items-center justify-center h-screen bg-transparent text-white">
        <div className="p-6 sm:p-8 rounded-lg shadow-lg max-w-md w-full backdrop-filter backdrop-blur-lg bg-white/10 border border-white/20">
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
    <div className="flex bg-transparent text-white">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-2 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4">
                <StatCard icon={<Ticket size={28} className="text-blue-500" />} title="Total Tickets Sold" value={totalTicketsSold} />
                <StatCard icon={<DollarSign size={28} className="text-blue-500" />} title="Total USDT Collected" value={`${parseFloat(totalUSDTCollected).toFixed(2)}`} />
                <StatCard icon={<Users size={28} className="text-blue-500" />} title="Total Users" value={totalUsers} />
                <StatCard icon={<Award size={28} className="text-blue-500" />} title="Total Winners" value={totalWinners} />
              </div>
            </div>
            <div className="lg:col-span-1 p-4 sm:p-6 rounded-lg shadow-lg flex flex-col backdrop-filter backdrop-blur-lg bg-white/10 border border-white/20">
              <h2 className="text-xl font-semibold mb-4">Admin Actions</h2>
              <div className="space-y-4 flex-grow">
                {ownerTicketGenerated ? (
                  <div>
                    <p className="text-lg">Owner Ticket ID:</p>
                    <div className="flex items-center">
                      <p className="p-3 bg-gray-700 rounded-lg font-mono mr-2 break-all">{ownerTicketId.toString()}</p>
                      <button
                        onClick={() => handleCopyOwnerTicketId(ownerTicketId.toString())}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
                      >
                        {copiedOwnerTicketId ? (
                          <Check size={20} className="text-green-400" />
                        ) : ( 
                          <Clipboard size={20} className="text-gray-400" />
                        )}
                      </button>
                    </div>
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

          <div className="p-4 sm:p-6 rounded-lg shadow-lg mb-6 backdrop-filter backdrop-blur-lg bg-white/10 border border-white/20"> 
            <TransactionTable transactions={transactions} onSelectTransaction={setSelectedTransaction} filterType={filterType} setFilterType={setFilterType} isAdmin={true} />
          </div>

          <div className="p-4 sm:p-6 rounded-lg shadow-lg mb-6 backdrop-filter backdrop-blur-lg bg-white/10 border border-white/20">
            <h2 className="text-xl font-semibold mb-4">Payout Requests</h2>
            <PayoutRequests payoutRequests={payoutRequests} handleProcessPayout={handleProcessPayout} />
          </div>

          <div className="p-4 sm:p-6 rounded-lg shadow-lg backdrop-filter backdrop-blur-lg bg-white/10 border border-white/20">
            <h2 className="text-xl font-semibold mb-4">User Stats</h2>
            <UserTable users={users} />
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
  <div className="p-4 rounded-xl shadow-lg flex items-center space-x-4 backdrop-filter backdrop-blur-lg bg-white/10 border border-white/20">
    <div className="flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-lg sm:text-xl font-bold">{value}</p>
    </div>
  </div>
);

const PayoutRequests = ({ payoutRequests, handleProcessPayout }) => (
  <div className="space-y-4">
    {payoutRequests.map((request, index) => (
      <div key={index} className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between p-4 rounded-lg backdrop-filter backdrop-blur-lg bg-white/10 border border-white/20 space-y-2 sm:space-y-0">
        <div className="mb-2 sm:mb-0">
          <p className="font-mono text-sm sm:text-base break-all">{request.user}</p>
          <p className="text-sm text-gray-400">{Web3.utils.fromWei(request.amount, 'ether')} USDT</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className='text-sm text-gray-400 mr-2'>({Number(request.earningType) === 0 ? 'Prize' : 'Referral'})</span>
          {request.processed ? (
            <span className={request.approved ? 'text-green-400' : 'text-red-400'}>
              {request.approved ? 'Approved' : 'Rejected'}
            </span>
          ) : (
            <>
              <span className="text-yellow-400 font-semibold">Pending</span>
              <button onClick={() => handleProcessPayout(index, true)} className="bg-gray-800 p-2 rounded-lg transition duration-300 hover:bg-gray-700">
                <Check size={20} className="text-green-500" strokeWidth={3} />
              </button>
              <button onClick={() => handleProcessPayout(index, false)} className="bg-gray-800 p-2 rounded-lg transition duration-300 hover:bg-gray-700">
                <X size={20} className="text-red-500" strokeWidth={3} />
              </button>
            </>
          )}
        </div>
      </div>
    ))}
  </div>
);

const UserTable = ({ users }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(users.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="p-2 sm:p-3">Wallet Address</th>
            <th className="p-2 sm:p-3 hidden md:table-cell">Referrer</th>
            <th className="p-2 sm:p-3">Pairs</th>
            <th className="p-2 sm:p-3 hidden lg:table-cell">Prize Earnings</th>
            <th className="p-2 sm:p-3 hidden lg:table-cell">Referral Earnings</th>
            <th className="p-2 sm:p-3 hidden md:table-cell">Claimed Reward</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.length > 0 ? (
            currentUsers.map((user, index) => (
              <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="p-2 sm:p-3 font-mono group relative">
                  <p className="cursor-pointer">{user.address.substring(0, 6)}...{user.address.substring(user.address.length - 4)}</p>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2">
                    {user.address}
                  </div>
                </td>
                <td className="p-2 sm:p-3 font-mono group relative hidden md:table-cell">
                  {user.referrer !== '0x0000000000000000000000000000000000000000' ? (
                    <>
                      <p className="cursor-pointer">{user.referrer.substring(0, 6)}...{user.referrer.substring(user.referrer.length - 4)}</p>
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2">
                        {user.referrer}
                      </div>
                    </>
                  ) : (
                    <span>N/A</span>
                  )}
                </td>
                <td className="p-2 sm:p-3 text-center">{user.pairsMatched.toString()}</td>
                <td className="p-2 sm:p-3 hidden lg:table-cell">{user.prizeEarnings}</td>
                <td className="p-2 sm:p-3 hidden lg:table-cell">{user.referralEarnings}</td>
                <td className="p-2 sm:p-3 hidden md:table-cell">{user.claimedReward}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="p-3 text-center text-gray-400">No users available.</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(pageNumber => {
            if (totalPages <= 3) return true;
            if (currentPage <= 2) return pageNumber <= 3;
            if (currentPage >= totalPages - 1) return pageNumber >= totalPages - 2;
            return pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1;
          })
          .map(pageNumber => (
            <button
              key={pageNumber}
              onClick={() => paginate(pageNumber)}
              className={`mx-1 px-3 py-1 rounded-lg ${
                currentPage === pageNumber ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {pageNumber}
            </button>
          ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};


export default Admin;