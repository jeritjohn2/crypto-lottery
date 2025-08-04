import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

const contests = [
  { id: 'weekly', name: 'Weekly Contest', contestType: 0, winners: 10 },
  { id: 'monthly', name: 'Monthly Contest', contestType: 1, winners: 4 },
  { id: 'quarterly', name: 'Quarterly Contest', contestType: 2, winners: 4 },
  { id: 'half-yearly', name: 'Half-Yearly Contest', contestType: 3, winners: 4 },
  { id: 'grand-1', name: 'Grand Prize 1st', contestType: 4, winners: 1 },
  { id: 'grand-2', name: 'Grand Prize 2nd', contestType: 5, winners: 2 },
  { id: 'grand-3', name: 'Grand Prize 3rd', contestType: 6, winners: 10 },
  { id: 'grand-4', name: 'Grand Prize 4th', contestType: 7, winners: 100 },
  { id: 'grand-5', name: 'Grand Prize 5th', contestType: 8, winners: 1000 },
  { id: 'grand-6', name: 'Grand Prize 6th', contestType: 9, winners: 2000 },
];

const WinnerSelectionDialog = ({ isOpen, onClose, lotteryContract }) => {
  const [selectedContestType, setSelectedContestType] = useState(null);
  const { showToast } = useToast();

  const handleSelectWinners = async () => {
    if (lotteryContract && selectedContestType !== null) {
      const contest = contests.find(c => c.contestType === selectedContestType);
      if (!contest) {
        showToast('Invalid contest selected.', 'error');
        return;
      }
      try {
        showToast('Please approve the transaction in your wallet.', 'info');
        await lotteryContract.methods.selectWinners(contest.contestType, contest.winners).send({ from: window.ethereum.selectedAddress });
        showToast('Winners selected successfully!', 'success');
        onClose();
      } catch (error) {
        console.error('Error selecting winners:', error);
        showToast('Failed to select winners.', 'error');
      }
    } else {
      showToast('Please select a contest type.', 'info');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white">Select Winners</h2>
        <div className="mb-6">
          <label htmlFor="contest-select" className="block text-gray-300 text-sm font-bold mb-2">Contest Type:</label>
          <select
            id="contest-select"
            className="block w-full bg-gray-700 border border-gray-600 text-white py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-gray-600 focus:border-blue-500"
            value={selectedContestType !== null ? selectedContestType : ''}
            onChange={(e) => setSelectedContestType(parseInt(e.target.value))}
          >
            <option value="" disabled>Select a contest</option>
            {contests.map((contest) => (
              <option key={contest.id} value={contest.contestType}>
                {contest.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSelectWinners}
            className="bg-accent hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Select Winners
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinnerSelectionDialog;