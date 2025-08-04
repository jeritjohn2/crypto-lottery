import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';

const contests = [
  { id: 'weekly', name: 'Weekly Contest', contestType: 0 },
  { id: 'monthly', name: 'Monthly Contest', contestType: 1 },
  { id: 'quarterly', name: 'Quarterly Contest', contestType: 2 },
  { id: 'half-yearly', name: 'Half-Yearly Contest', contestType: 3 },
  { id: 'grand-1', name: 'Grand Prize 1st', contestType: 4 },
  { id: 'grand-2', name: 'Grand Prize 2nd', contestType: 5 },
  { id: 'grand-3', name: 'Grand Prize 3rd', contestType: 6 },
  { id: 'grand-4', name: 'Grand Prize 4th', contestType: 7 },
  { id: 'grand-5', name: 'Grand Prize 5th', contestType: 8 },
  { id: 'grand-6', name: 'Grand Prize 6th', contestType: 9 },
];

const Winners = ({ lotteryContract }) => {
  const [allWinners, setAllWinners] = useState({});
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAllWinners = async () => {
      if (!lotteryContract) return;

      const fetchedWinnersData = {};
      for (const contest of contests) {
        try {
          const winners = await lotteryContract.methods.getWinnersByContest(contest.contestType).call();
          fetchedWinnersData[contest.id] = winners;
        } catch (error) {
          console.error(`Error fetching winners for ${contest.name}:`, error);
          showToast(`Error fetching winners for ${contest.name}.`, 'error');
        }
      }
      setAllWinners(fetchedWinnersData);
    };

    fetchAllWinners();
  }, [lotteryContract, showToast]);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-text mb-6">All Contest Winners</h2>

      {contests.map((contest) => (
        <div key={contest.id} className="bg-primary p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold mb-4 text-accent">{contest.name}</h3>
          {
            allWinners[contest.id] && allWinners[contest.id].length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allWinners[contest.id].map((winner, index) => (
                  <div key={index} className="bg-secondary p-4 rounded-lg shadow-md flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-mono text-lg break-all">{winner}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No winners yet for this contest.</p>
            )
          }
        </div>
      ))}
    </div>
  );
};

export default Winners;
