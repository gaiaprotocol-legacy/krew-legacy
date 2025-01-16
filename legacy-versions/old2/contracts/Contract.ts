import { Confirm, EventContainer, msg } from "@common-module/app";
import { BaseContract, ContractInterface, ethers } from "ethers";
import Env from "../Env.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import ConnectWalletPopup from "../wallet/ConnectWalletPopup.js";

export default abstract class Contract<CT extends BaseContract>
  extends EventContainer {
  protected viewContract!: CT;

  private address!: string;

  constructor(private abi: ContractInterface) {
    super();
  }

  public init(address: string) {
    this.address = address;

    this.viewContract = new ethers.Contract(
      this.address,
      this.abi,
      new ethers.providers.JsonRpcProvider(Env.kromaRpc),
    ) as any;
  }

  protected async getWriteContract(): Promise<CT> {
    if (!KrewSignedUserManager.signed) {
      try {
        await new Confirm({
          title: msg("not-signed-in-title"),
          message: msg("not-signed-in-message"),
          confirmTitle: msg("not-signed-in-confirm"),
        }, () => KrewSignedUserManager.signIn()).wait();
      } catch (e) {
        throw new Error("Not signed in");
      }
    }

    if (!KrewSignedUserManager.user?.wallet_address) {
      try {
        await new Confirm({
          title: msg("no-wallet-linked-title"),
          message: msg("no-wallet-linked-message"),
          confirmTitle: msg("no-wallet-linked-confirm"),
        }, async () => {
          const wallet = await (new ConnectWalletPopup()).wait();
          await KrewSignedUserManager.linkWallet(wallet);
        }).wait();
      } catch (e) {
        throw new Error("No wallet linked");
      }
    }

    const signer = await KrewSignedUserManager.getContractSigner();
    if (!signer) throw new Error("No signer");

    return new ethers.Contract(this.address, this.abi, signer) as any;
  }
}
