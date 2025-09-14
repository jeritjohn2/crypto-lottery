import { NavLink } from 'react-router-dom';
import { Home, UserCog, Ticket, Award, DollarSign, GitMerge, Gift, Wallet, X } from 'lucide-react';
import logo from '../assets/logo.jpg';

const Sidebar = ({ walletAddress, connectWallet, isOpen, setIsOpen }) => (
  <>
    <div
      className={`fixed inset-0 bg-black/50 z-20 md:hidden ${isOpen ? 'block' : 'hidden'}`}
      onClick={() => setIsOpen(false)}
    ></div>
    <div className={`fixed top-0 left-0 h-full w-64 bg-background p-6 flex flex-col shadow-lg border-r border-gray-900 z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:shadow-none md:border-r`}>
      <div className="flex items-center mb-8">
        <img src={logo} alt="Crypto Lottery Logo" className="w-8 h-8 mr-3" />
        <h1 className="text-2xl font-bold">Crypto Lottery</h1>
        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white md:hidden">
          <X size={24} />
        </button>
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
  </>
);

const SidebarLink = ({ icon, text, to }) => (
  <NavLink to={to} end className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}>
    {icon}
    <span className="ml-3">{text}</span>
  </NavLink>
);

export default Sidebar;
