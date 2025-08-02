import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar } from 'lucide-react';

const contests = [
  { id: 'weekly', name: 'Weekly Contest', winners: 10, prize: 50, icon: <Calendar /> },
  { id: 'monthly', name: 'Monthly Contest', winners: 4, prize: 200, icon: <Calendar /> },
  { id: 'quarterly', name: 'Quarterly Contest', winners: 4, prize: 400, icon: <Calendar /> },
  { id: 'half-yearly', name: 'Half-Yearly Contest', winners: 4, prize: 800, icon: <Calendar /> },
  { id: 'grand-1', name: 'Grand Prize 1st', winners: 1, prize: 100000, icon: <Trophy /> },
  { id: 'grand-2', name: 'Grand Prize 2nd', winners: 2, prize: 50000, icon: <Trophy /> },
  { id: 'grand-3', name: 'Grand Prize 3rd', winners: 10, prize: 10000, icon: <Trophy /> },
  { id: 'grand-4', name: 'Grand Prize 4th', winners: 100, prize: 1000, icon: <Trophy /> },
  { id: 'grand-5', name: 'Grand Prize 5th', winners: 1000, prize: 100, icon: <Trophy /> },
  { id: 'grand-6', name: 'Grand Prize 6th', winners: 2000, prize: 50, icon: <Trophy /> },
];

const ContestCard = ({ contest, navigate }) => (
  <div
    className="bg-primary p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between cursor-pointer"
    onClick={() => navigate(`/contest/${contest.id}`)}
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
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold mb-8 text-center">All Contests</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {contests.map(contest => (
          <ContestCard key={contest.id} contest={contest} navigate={navigate} />
        ))}
      </div>
    </div>
  );
};

export default Contest;

