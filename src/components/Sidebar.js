import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.jpg';

const Sidebar = () => (
  <div className="w-64 bg-primary p-6 flex flex-col shadow-lg">
    <div className="flex items-center mb-8">
      <img src={logo} alt="Crypto Lottery Logo" className="h-10 w-10 rounded-full mr-4" />
      <h1 className="text-2xl font-bold text-text">Crypto Lottery</h1>
    </div>
    <nav className="flex flex-col space-y-2">
      <NavLink to="/" end className={({ isActive }) => `px-4 py-2 rounded-lg ${isActive ? 'bg-accent text-white' : 'hover:bg-secondary'}`}>
        Home
      </NavLink>
      <NavLink to="/contest" className={({ isActive }) => `px-4 py-2 rounded-lg ${isActive ? 'bg-accent text-white' : 'hover:bg-secondary'}`}>
        Contest
      </NavLink>
      <NavLink to="/admin" className={({ isActive }) => `px-4 py-2 rounded-lg ${isActive ? 'bg-accent text-white' : 'hover:bg-secondary'}`}>
        Admin
      </NavLink>
    </nav>
  </div>
);

export default Sidebar;
