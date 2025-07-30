import React from 'react';

const Contest = ({
  selectedContestType,
  setSelectedContestType,
  selectedRound,
  setSelectedRound,
  handleFetchWinners,
  fetchedWinners
}) => (
  <div>
    <h3>Check Winners</h3>
    <div>
      <label>Contest Type:</label>
      <select value={selectedContestType} onChange={(e) => setSelectedContestType(e.target.value)}>
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
      <label>Round:</label>
      <input
        type="number"
        value={selectedRound}
        min="0"
        onChange={(e) => setSelectedRound(e.target.value)}
      />
    </div>
    <button className="btn" onClick={handleFetchWinners}>Fetch Winners</button>

    {fetchedWinners.length > 0 && (
      <div>
        <h4>Winning Tickets (Contest {selectedContestType}, Round {selectedRound})</h4>
        <ul>
          {fetchedWinners.map(tid => (
            <li key={tid}>Ticket #{tid}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export default Contest;
