import { ethers } from 'ethers';
import lotteryABI from './abi/lotteryABI.json';
import usdtABI from './abi/usdtABI.json';

const lotteryAddress = '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853';
const usdtAddress = '0xE19dEdb38c150eb56181517BBD4Ec282826AdEee';

export const getContracts = (provider) => {
  const signer = provider.getSigner();
  const lottery = new ethers.Contract(lotteryAddress, lotteryABI, signer);
  const usdt = new ethers.Contract(usdtAddress, usdtABI, signer);
  return { lottery, usdt };
};
