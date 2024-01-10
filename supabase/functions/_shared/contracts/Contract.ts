import {
  BaseContract,
  ContractInterface,
  ethers,
} from "https://esm.sh/ethers@5.6.8";

export default abstract class Contract<CT extends BaseContract> {
  protected ethersContract: CT;

  constructor(
    address: string,
    abi: ContractInterface,
    signer: ethers.Signer,
  ) {
    this.ethersContract = new ethers.Contract(
      address,
      abi,
      signer,
    ) as any;
  }
}
