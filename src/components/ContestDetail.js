import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

const contests = [
  { id: 'weekly', name: 'Weekly Contest', winners: 10, prize: 50, contestType: 0 },
  { id: 'monthly', name: 'Monthly Contest', winners: 4, prize: 200, contestType: 1 },
  { id: 'quarterly', name: 'Quarterly Contest', winners: 4, prize: 400, contestType: 2 },
  { id: 'half-yearly', name: 'Half-Yearly Contest', winners: 4, prize: 800, contestType: 3 },
  { id: 'grand-1', name: 'Grand Prize 1st', winners: 1, prize: 100000, contestType: 4 },
  { id: 'grand-2', name: 'Grand Prize 2nd', winners: 2, prize: 50000, contestType: 5 },
  { id: 'grand-3', name: 'Grand Prize 3rd', winners: 10, prize: 10000, contestType: 6 },
  { id: 'grand-4', name: 'Grand Prize 4th', winners: 100, prize: 1000, contestType: 7 },
  { id: 'grand-5', name: 'Grand Prize 5th', winners: 1000, prize: 100, contestType: 8 },
  { id: 'grand-6', name: 'Grand Prize 6th', winners: 2000, prize: 50, contestType: 9 },
];

const ContestDetail = ({ lotteryContract }) => {
  const { id } = useParams();
  const contest = contests.find(c => c.id === id);
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [winners, setWinners] = useState([]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAdmin(true);
    } else {
      alert('Incorrect password');
    }
  };

  const fetchWinners = useCallback(async () => {
    if (lotteryContract && contest) {
      try {
        const fetchedWinners = await lotteryContract.methods.getWinnersByContest(contest.contestType).call();
        setWinners(fetchedWinners);
      } catch (error) {
        console.error('Error fetching winners:', error);
      }
    }
  }, [lotteryContract, contest]);

  const handleSelectWinners = async () => {
    if (lotteryContract && contest) {
      try {
        await lotteryContract.methods.selectWinners(contest.contestType, contest.winners).send({ from: window.ethereum.selectedAddress });
        alert('Winners selected successfully!');
        fetchWinners();
      } catch (error) {
        console.error('Error selecting winners:', error);
        alert('Failed to select winners.');
      }
    }
  };

  useEffect(() => {
    fetchWinners();
  }, [fetchWinners]);

  if (!contest) {
    return <div>Contest not found</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-primary p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-4">{contest.name}</h2>
        <div className="text-gray-400 space-y-2 mb-6">
          <p>{contest.winners} winners</p>
          <p>{contest.prize} USDT</p>
        </div>

        {!isAdmin ? (
          <div className="bg-secondary p-6 rounded-lg shadow-inner mb-8">
            <h3 className="text-xl font-bold mb-4 text-center">Admin Login</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-background text-text placeholder-gray-500 p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                className="w-full bg-accent hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
              >
                Login
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={handleSelectWinners}
            className="w-full bg-accent hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 mb-8"
          >
            Select Winners
          </button>
        )}

        <div>
          <h3 className="text-2xl font-semibold mb-4">Winners</h3>
          {winners.length > 0 ? (
            <ul className="space-y-2">
              {winners.map((winner, index) => (
                <li key={index} className="p-3 bg-secondary rounded-lg font-mono">Ticket #{winner}</li>
              ))}
            </ul>
          ) : (
            <p>No winners selected for this contest yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContestDetail;
