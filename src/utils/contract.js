import { ethers } from 'ethers';
import lotteryABI from '../abi/lotteryAbi.json';
import { LOTTERY_ADDRESS, USDT_ADDRESS } from '../constants';

export const getContracts = (provider) => {
  const signer = provider.getSigner();
  const lottery = new ethers.Contract(LOTTERY_ADDRESS, lotteryABI, signer);
  const usdt = new ethers.Contract(USDT_ADDRESS, [
        {
          constant: false,
          inputs: [{ name: "_spender", type: "address" }, { name: "_value", type: "uint256" }],
          name: "approve",
          outputs: [{ name: "", type: "bool" }],
          type: "function"
        }
      ], signer);
  return { lottery, usdt };
};

