import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { getContracts } from '../utils/contract';
import { useToast } from '../contexts/ToastContext';
import { DollarSign, Send } from 'lucide-react';

const Payout = () => {
  const [lotteryContract, setLotteryContract] = useState(null);
  const [earnings, setEarnings] = useState('0');
  const [amount, setAmount] = useState('');
  const [userRequests, setUserRequests] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        const { lottery } = getContracts(web3Instance);
        setLotteryContract(lottery);

        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          const user = await lottery.methods.users(accounts[0]).call();
          setEarnings(web3Instance.utils.fromWei(user.earnings, 'ether'));

          const requestIndexes = await lottery.methods.getUserPayoutRequests(accounts[0]).call();
          const allRequests = await lottery.methods.getAllPayoutRequests().call();
          const userPayoutRequests = requestIndexes.map(index => allRequests[index]);
          setUserRequests(userPayoutRequests);
        }
      }
    };
    init();
  }, []);

  const handleRequestPayout = async () => {
    if (lotteryContract && amount) {
      try {
        const web3Instance = new Web3(window.ethereum);
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          showToast('Please approve the transaction in your wallet.', 'info');
          const amountInWei = web3Instance.utils.toWei(amount, 'ether');
          await lotteryContract.methods.requestPayout(amountInWei).send({ from: accounts[0] });
          showToast('Payout request sent successfully!', 'success');
          const user = await lotteryContract.methods.users(accounts[0]).call();
          setEarnings(web3Instance.utils.fromWei(user.earnings, 'ether'));
          setAmount('');

          const requestIndexes = await lotteryContract.methods.getUserPayoutRequests(accounts[0]).call();
          const allRequests = await lotteryContract.methods.getAllPayoutRequests().call();
          const userPayoutRequests = requestIndexes.map(index => allRequests[index]);
          setUserRequests(userPayoutRequests);
        }
      } catch (error) {
        console.error('Error requesting payout:', error);
        showToast('Failed to send payout request.', 'error');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto p-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Request Payout</h2>
          <div className="space-y-6">
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-400">Your Current Earnings</p>
              <p className="text-3xl font-bold text-white">{parseFloat(earnings).toFixed(2)} USDT</p>
            </div>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to withdraw"
                className="w-full bg-gray-700 text-white placeholder-gray-500 p-3 pr-12 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={handleRequestPayout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
              <Send className="mr-2" />
              Request Payout
            </button>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto mt-6">
          <h2 className="text-xl font-semibold mb-4">Your Payout Requests</h2>
          <div className="space-y-4">
            {userRequests.map((request, index) => (
              <div key={index} className="flex flex-wrap items-center justify-between bg-gray-700/50 p-4 rounded-lg">
                <div className="mb-2 sm:mb-0">
                  <p className="text-sm text-gray-400">{new Date().toLocaleString()}</p>
                  <p className="font-mono">{Web3.utils.fromWei(request.amount, 'ether')} USDT</p>
                </div>
                <div className="flex items-center space-x-2">
                  {request.processed ? (
                    <span className={request.approved ? 'text-green-400' : 'text-red-400'}>
                      {request.approved ? 'Approved' : 'Rejected'}
                    </span>
                  ) : (
                    <span className="text-yellow-400 font-semibold">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payout;
