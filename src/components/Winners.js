import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { contests } from '../constants';

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
      <h2 className="text-2xl sm:text-3xl font-bold text-text mb-6">All Contest Winners</h2>

      {contests.map((contest) => (
        <div key={contest.id} className="p-4 sm:p-6 rounded-lg shadow-lg backdrop-filter backdrop-blur-lg bg-white/10 border border-white/20">
          <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-accent">{contest.name}</h3>
          {
            allWinners[contest.id] && allWinners[contest.id].length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allWinners[contest.id].map((winner, index) => (
                  <div key={index} className="p-4 rounded-lg shadow-md flex items-center space-x-3 backdrop-filter backdrop-blur-lg bg-white/10 border border-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-mono text-sm sm:text-lg break-all">{winner}</p>
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
