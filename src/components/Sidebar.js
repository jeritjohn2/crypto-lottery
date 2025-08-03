import { NavLink } from 'react-router-dom';
import { Shield, Home, UserCog, Ticket, Award, DollarSign } from 'lucide-react';

const Sidebar = () => (
  <div className="w-64 bg-gray-800 p-6 flex flex-col shadow-lg">
    <div className="flex items-center mb-8">
      <Shield size={32} className="text-blue-500 mr-3" />
      <h1 className="text-2xl font-bold">Crypto Lottery</h1>
    </div>
    <nav className="flex flex-col space-y-2">
      <SidebarLink icon={<Home size={20} />} text="Home" to="/" />
      <SidebarLink icon={<Ticket size={20} />} text="All Contests" to="/contest" />
      <SidebarLink icon={<Award size={20} />} text="Winners" to="/winners" />
      <SidebarLink icon={<DollarSign size={20} />} text="Payout Requests" to="/payouts" />
      <SidebarLink icon={<UserCog size={20} />} text="Admin" to="/admin" />
    </nav>
  </div>
);

const SidebarLink = ({ icon, text, to }) => (
  <NavLink to={to} end className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}>
    {icon}
    <span className="ml-3">{text}</span>
  </NavLink>
);

export default Sidebar;