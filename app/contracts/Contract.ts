import { Confirm, ErrorAlert, EventContainer, msg } from "@common-module/app";
import { BaseContract, ContractInterface, ethers } from "ethers";
import Env from "../Env.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import SwitchToKromaPopup from "../wallet/SwitchToKromaPopup.js";
import WalletManager from "../wallet/WalletManager.js";

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

    if (await WalletManager.connected() !== true) await WalletManager.connect();

    if (!KrewSignedUserManager.user?.wallet_address) {
      try {
        await new Confirm({
          title: msg("no-wallet-linked-title"),
          message: msg("no-wallet-linked-message"),
          confirmTitle: msg("no-wallet-linked-confirm"),
          loadingTitle: msg("no-wallet-linked-linking"),
        }, () => KrewSignedUserManager.linkWallet()).wait();
      } catch (e) {
        throw new Error("No wallet linked");
      }
    }

    if (
      await WalletManager.getAddress() !==
        KrewSignedUserManager.user?.wallet_address
    ) {
      new ErrorAlert({
        title: msg("wallet-address-mismatch-title"),
        message: msg("wallet-address-mismatch-message"),
      });
      throw new Error("Wallet address mismatch");
    }

    const chainId = await WalletManager.getChainId();
    if (!chainId) {
      new ErrorAlert({
        title: msg("invalid-network-title"),
        message: msg("invalid-network-message"),
      });
      throw new Error("Invalid network");
    }

    if (chainId !== Env.kromaChainId) {
      await new SwitchToKromaPopup().wait();
    }

    const signer = await KrewSignedUserManager.getContractSigner();
    if (!signer) throw new Error("No signer");

    return new ethers.Contract(this.address, this.abi, signer) as any;
  }
}
