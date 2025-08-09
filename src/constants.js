import React from 'react';
import { Trophy, Calendar } from 'lucide-react';

export const LOTTERY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
export const USDT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const contests = [
  { id: 'weekly', name: 'Weekly Contest', contestType: 0, winners: 5, prize: 50, icon: <Calendar /> },
  { id: 'monthly', name: 'Monthly Contest', contestType: 1, winners: 4, prize: 100, icon: <Calendar /> },
  { id: 'quarterly', name: 'Quarterly Contest', contestType: 2, winners: 4, prize: 200, icon: <Calendar /> },
  { id: 'half-yearly', name: 'Half-Yearly Contest', contestType: 3, winners: 4, prize: 400, icon: <Calendar /> },
  { id: 'grand-1', name: 'Grand Prize 1st', contestType: 4, winners: 1, prize: 100000, icon: <Trophy /> },
  { id: 'grand-2', name: 'Grand Prize 2nd', contestType: 5, winners: 3, prize: 20000, icon: <Trophy /> },
  { id: 'grand-3', name: 'Grand Prize 3rd', contestType: 6, winners: 8, prize: 10000, icon: <Trophy /> },
  { id: 'grand-4', name: 'Grand Prize 4th', contestType: 7, winners: 100, prize: 1000, icon: <Trophy /> },
  { id: 'grand-5', name: 'Grand Prize 5th', contestType: 8, winners: 500, prize: 100, icon: <Trophy /> },
  { id: 'grand-6', name: 'Grand Prize 6th', contestType: 9, winners: 1000, prize: 50, icon: <Trophy /> },
];