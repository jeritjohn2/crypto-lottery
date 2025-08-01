import React from 'react';

const Contest = ({
  selectedContestType,
  setSelectedContestType,
  selectedRound,
  setSelectedRound,
  handleFetchWinners,
  fetchedWinners
}) => (
  <div className="space-y-8">
    <div className="bg-primary p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Check Winners</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contestType" className="block mb-2 font-semibold">Contest Type:</label>
          <select
            id="contestType"
            value={selectedContestType}
            onChange={(e) => setSelectedContestType(e.target.value)}
            className="w-full bg-secondary text-text p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="0">Weekly</option>
            <option value="1">Monthly</option>
            <option value="2">Quarterly</option>
            <option value="3">Half-Yearly</option>
            <option value="4">Grand Prize 1st</option>
            <option value="5">Grand Prize 2nd</option>
            <option value="6">Grand Prize 3rd</option>
            <option value="7">Grand Prize 4th</option>
            <option value="8">Grand Prize 5th</option>
            <option value="9">Grand Prize 6th</option>
          </select>
        </div>
        <div>
          <label htmlFor="round" className="block mb-2 font-semibold">Round:</label>
          <input
            id="round"
            type="number"
            value={selectedRound}
            min="0"
            onChange={(e) => setSelectedRound(e.target.value)}
            className="w-full bg-secondary text-text p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>
      <button
        className="w-full mt-6 bg-accent hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
        onClick={handleFetchWinners}
      >
        Fetch Winners
      </button>
    </div>

    {fetchedWinners.length > 0 && (
      <div className="bg-primary p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Winning Tickets (Contest {selectedContestType}, Round {selectedRound})</h3>
        <ul className="space-y-2">
          {fetchedWinners.map(tid => (
            <li key={tid} className="p-3 bg-secondary rounded-lg font-mono">Ticket #{tid.toString()}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export default Contest;
