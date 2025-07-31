import { ethers } from 'ethers';
import lotteryABI from '../abi/lotteryAbi.json';

const lotteryAddress = '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853';
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
