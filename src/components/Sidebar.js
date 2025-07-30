import { NavLink } from 'react-router-dom';
import '../styles.css';
import logo from '../assets/logo.jpg'; // Assuming you have a logo image in assets
const Sidebar = () => (
  <div className="sidebar">
    <h2>Crypto Lottery</h2>
    <nav>
      <ul>
        <img src={logo} alt="Crypto Lottery Logo" className="sidebar-logo" />
        <li><NavLink to="/" end className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>Home</NavLink></li>
        <li><NavLink to="/contest" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>Contest</NavLink></li>
        <li><NavLink to="/admin" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>Admin</NavLink></li>
      </ul>
    </nav>
  </div>
);

export default Sidebar;
