import { NavLink } from 'react-router-dom';
import { Shield, Home, UserCog, Ticket, Award, DollarSign, GitMerge, Gift, Wallet } from 'lucide-react';

const Sidebar = ({ walletAddress, connectWallet }) => (
  <div className="w-64 bg-gray-800 p-6 flex flex-col shadow-lg">
    <div className="flex items-center mb-8">
      <Shield size={32} className="text-blue-500 mr-3" />
      <h1 className="text-2xl font-bold">Crypto Lottery</h1>
    </div>
    <nav className="flex flex-col space-y-2 flex-grow">
      <SidebarLink icon={<Home size={20} />} text="Home" to="/" />
      <SidebarLink icon={<Ticket size={20} />} text="All Contests" to="/contest" />
      <SidebarLink icon={<Award size={20} />} text="Winners" to="/winners" />
      <SidebarLink icon={<DollarSign size={20} />} text="Payout" to="/payout" />
      <SidebarLink icon={<GitMerge size={20} />} text="Referral Tree" to="/referral-tree" />
      <SidebarLink icon={<Gift size={20} />} text="Products" to="/products" />
      <SidebarLink icon={<UserCog size={20} />} text="Admin" to="/admin" />
    </nav>
    <div className="mt-auto pt-4 border-t border-gray-700">
      {walletAddress ? (
        <div className="flex items-center justify-center bg-green-600 text-white py-2 px-4 rounded-lg text-sm">
          <Wallet size={16} className="mr-2" />
          <span>Connected: {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}</span>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-sm"
        >
          Connect Wallet
        </button>
      )}
    </div>
  </div>
);

const SidebarLink = ({ icon, text, to }) => (
  <NavLink to={to} end className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}>
    {icon}
    <span className="ml-3">{text}</span>
  </NavLink>
);

export default Sidebar;
