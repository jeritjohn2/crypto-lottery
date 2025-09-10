import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { getContracts } from '../utils/contract';
import { useToast } from '../contexts/ToastContext';
import { DollarSign, Send } from 'lucide-react';

const Payout = () => {
  const [lotteryContract, setLotteryContract] = useState(null);
  const [prizeEarnings, setPrizeEarnings] = useState('0');
  const [referralEarnings, setReferralEarnings] = useState('0');
  const [amount, setAmount] = useState('');
  const [earningType, setEarningType] = useState('Prize');
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
          const user = await lottery.methods.getUser(accounts[0]).call();
          setPrizeEarnings(web3Instance.utils.fromWei(user[5], 'ether'));
          setReferralEarnings(web3Instance.utils.fromWei(user[6], 'ether'));

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
      if (parseFloat(amount) < 1) {
        showToast('Minimum payout amount is 10 USDT.', 'error');
        return;
      }
      try {
        const web3Instance = new Web3(window.ethereum);
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          showToast('Please approve the transaction in your wallet.', 'info');
          const amountInWei = web3Instance.utils.toWei(amount, 'ether');
          const earningTypeValue = earningType === 'Prize' ? 0 : 1;
          await lotteryContract.methods.requestPayout(amountInWei, earningTypeValue).send({ from: accounts[0] });
          showToast('Payout request sent successfully!', 'success');
          const user = await lotteryContract.methods.getUser(accounts[0]).call();
          setPrizeEarnings(web3Instance.utils.fromWei(user[5], 'ether'));
          setReferralEarnings(web3Instance.utils.fromWei(user[6], 'ether'));
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
        <div className="p-6 rounded-lg shadow-lg max-w-md mx-auto backdrop-filter backdrop-blur-lg bg-white/10 border border-white/20">
          <h2 className="text-2xl font-bold mb-2 text-center text-white">Request Payout</h2>
          <p className="text-center text-gray-400 mb-6 text-sm">A 5% service charge will be applied to all payouts.</p>
          <p className="text-center text-gray-400 mb-6 text-sm">Minimum payout amount is 10 USDT.</p>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg text-center backdrop-filter backdrop-blur-lg bg-white/10 border border-white/20">
                <p className="text-sm text-gray-400">Prize Earnings</p>
                <p className="text-3xl font-bold text-white">{parseFloat(prizeEarnings).toFixed(2)} USDT</p>
              </div>
              <div className="p-4 rounded-lg text-center backdrop-filter backdrop-blur-lg bg-white/10 border border-white/20">
                <p className="text-sm text-gray-400">Referral Earnings</p>
                <p className="text-3xl font-bold text-white">{parseFloat(referralEarnings).toFixed(2)} USDT</p>
              </div>
            </div>
            <div className="relative">
              <select
                value={earningType}
                onChange={(e) => setEarningType(e.target.value)}
                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              >
                <option value="Prize">Prize Earnings</option>
                <option value="Referral">Referral Earnings</option>
              </select>
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

        <div className="p-6 rounded-lg shadow-lg max-w-md mx-auto mt-6 backdrop-filter backdrop-blur-lg bg-white/10 border border-white/20">
          <h2 className="text-xl font-semibold mb-4">Your Payout Requests</h2>
          <div className="space-y-4">
            {userRequests.map((request, index) => (
              <div key={index} className="flex flex-wrap items-center justify-between p-4 rounded-lg backdrop-filter backdrop-blur-lg bg-white/10 border border-white/20">
                <div className="mb-2 sm:mb-0">
                  <p className="text-sm text-gray-400">{new Date().toLocaleString()}</p>
                  <p className="font-mono">{Web3.utils.fromWei(request.amount, 'ether')} USDT</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className='text-sm text-gray-400 mr-2'>({Number(request.earningType) === 0 ? 'Prize' : 'Referral'})</span>
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