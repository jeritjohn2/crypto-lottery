
import lotteryABI from '../abi/lotteryAbi.json';
import { LOTTERY_ADDRESS, USDT_ADDRESS } from '../constants';

export const getContracts = (web3) => {
  const lottery = new web3.eth.Contract(lotteryABI, LOTTERY_ADDRESS);
  const usdt = new web3.eth.Contract([
        {
          constant: false,
          inputs: [{ name: "_spender", type: "address" }, { name: "_value", type: "uint256" }],
          name: "approve",
          outputs: [{ name: "", type: "bool" }],
          type: "function"
        }
      ], USDT_ADDRESS);
  return { lottery, usdt };
};

