import React from 'react';
import { contests } from '../constants';

const ContestCard = ({ contest }) => (
  <div
    className="bg-primary p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between cursor-pointer"
  >
    <div>
      <div className="flex items-center text-accent mb-4">
        {React.cloneElement(contest.icon, { size: 24, className: "mr-3" })}
        <h3 className="text-xl font-bold text-text">{contest.name}</h3>
      </div>
      <div className="text-gray-400 space-y-2">
        <p>{contest.winners} winners</p>
        <p>{contest.prize} USDT</p>
      </div>
    </div>
  </div>
);

const Contest = () => {

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold mb-8 text-center">All Contests</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {contests.map(contest => (
          <ContestCard key={contest.id} contest={contest} />
        ))}
      </div>
    </div>
  );
};

export default Contest;

