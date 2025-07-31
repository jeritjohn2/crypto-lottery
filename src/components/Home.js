import React from 'react';

const   Home = ({
  walletAddress,
  connectWallet,
  checkUSDTBalance,
  checkUSDTAllowance,
  approveUSDT,
  referralCode,
  setReferralCode,
  handleBuyTicket,
  isRegistered,
  userData,
  userTickets,
  winningTickets,
  web3
}) => (
  <div>
    {!walletAddress ? (
      <button className="btn" onClick={connectWallet}>Connect Wallet</button>
    ) : (
      <>
        <p className="wallet-address">Connected: <strong>{walletAddress}</strong></p>
        <button className="btn" onClick={checkUSDTBalance}>Check USDT Balance</button>
        <button className="btn" onClick={checkUSDTAllowance}>Check USDT Allowance</button>
        <button className="btn" onClick={approveUSDT}>Approve USDT</button>
      </>
    )}

    {walletAddress && (
      <div className="referral-box">
        <input
          type="text"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          placeholder="Enter referral ticket ID (required)"
          className="referral-input"
        />
        <button onClick={() => handleBuyTicket(referralCode)} className="buy-ticket-button">
          Buy Ticket with Referral
        </button>
      </div>
    )}

    {walletAddress && isRegistered && userData && (
      <div className="atm-card">
        <p>Wallet: {walletAddress}</p>
        <p>Earnings: {web3.utils.fromWei(userData.earnings || '0', 'ether')} USDT</p>

        <div className="ticket-list">
          <h3>Your Ticket Numbers:</h3>
          {userTickets.length === 0 ? (
            <p>No tickets yet.</p>
          ) : (
            <ul>
              {userTickets.map((ticket, index) => {
                const isWinner = winningTickets.includes(parseInt(ticket));
                return (
                  <li key={index}>
                    Ticket #{ticket} {isWinner && <span style={{ color: 'green' }}>🏆 Winner!</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    )}
  </div>
);

export default Home;
