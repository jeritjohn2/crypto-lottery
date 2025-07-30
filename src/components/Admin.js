import React, { useState } from 'react';

const Admin = () => {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    if (password === 'admin123') {
      setLoggedIn(true);
    } else {
      alert('Incorrect password');
    }
  };

  return (
    <div>
      {!loggedIn ? (
        <div>
          <h2>Admin Login</h2>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter admin password"
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <h2>Admin Panel</h2>
          {/* Admin features go here */}
        </div>
      )}
    </div>
  );
};

export default Admin;
