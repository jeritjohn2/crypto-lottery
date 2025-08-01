import { ethers } from 'ethers';
import lotteryABI from '../abi/lotteryAbi.json';

const lotteryAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const usdtAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const getContracts = (provider) => {
  const signer = provider.getSigner();
  const lottery = new ethers.Contract(lotteryAddress, lotteryABI, signer);
  const usdt = new ethers.Contract(usdtAddress, [
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
