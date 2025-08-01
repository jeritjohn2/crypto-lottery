import React from 'react';

const Home = ({
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
  <div className="space-y-8">
    <div className="bg-primary p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Wallet</h2>
      {!walletAddress ? (
        <button className="w-full bg-accent hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300" onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-lg">Connected: <strong className="font-mono break-all">{walletAddress}</strong></p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-secondary hover:bg-gray-700 text-text font-bold py-2 px-4 rounded-lg transition duration-300" onClick={checkUSDTBalance}>
              Check USDT Balance
            </button>
            <button className="bg-secondary hover:bg-gray-700 text-text font-bold py-2 px-4 rounded-lg transition duration-300" onClick={checkUSDTAllowance}>
              Check USDT Allowance
            </button>
            <button className="bg-accent hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300" onClick={approveUSDT}>
              Approve USDT
            </button>
          </div>
        </div>
      )}
    </div>

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
          <button onClick={() => handleBuyTicket(referralCode)} className="bg-accent hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
            Buy Ticket with Referral
          </button>
        </div>
      </div>
    )}

    {walletAddress && isRegistered && userData && (
      <div className="bg-primary p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Your Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-lg">Earnings: <strong className="font-mono">{web3.utils.fromWei(userData.earnings || '0', 'ether')} USDT</strong></p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Your Tickets:</h3>
            {userTickets.length === 0 ? (
              <p>No tickets yet.</p>
            ) : (
              <ul className="space-y-2">
                {userTickets.map((ticket, index) => {
                  const isWinner = winningTickets.includes(parseInt(ticket));
                  return (
                    <li key={index} className={`p-2 rounded-lg ${isWinner ? 'bg-green-500 text-white' : 'bg-secondary'}`}>
                      Ticket #{ticket.toString()} {isWinner && <span className="font-bold">🏆 Winner!</span>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);

export default Home;
