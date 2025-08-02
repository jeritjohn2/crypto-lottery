import React from 'react';
import { Wallet, Ticket, DollarSign, Users } from 'lucide-react';

const 
StatCard = ({ icon, label, value }) => (
  <div className="bg-secondary p-4 rounded-lg flex items-center hover:scale-105 transition-transform duration-300">
    <div className="p-3 rounded-full bg-background mr-4">{icon}</div>
    <div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-lg font-semibold break-all">{value}</p>
    </div>
  </div>
);

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
  const formatAddress = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : 'None';

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

      {walletAddress && (
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
        <div className="bg-primary p-8 rounded-2xl shadow-2xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Your Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              icon={<Wallet size={24} className="text-accent" />}
              label="Wallet Address"
              value={formatAddress(walletAddress)}
            />
            <StatCard
              icon={<Ticket size={24} className="text-accent" />}
              label="1st Ticket ID"
              value={userTickets.length > 0 ? userTickets[0] : 'None'}
            />
            <StatCard
              icon={<DollarSign size={24} className="text-accent" />}
              label="Total Earnings"
              value={`${web3.utils.fromWei(userData?.[5] || '0', 'ether')} USDT`}
            />
            <StatCard
              icon={<Users size={24} className="text-accent" />}
              label="Pair Count"
              value={userData?.[4]?.toString() || '0'}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
