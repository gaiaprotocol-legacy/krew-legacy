import { getNetwork, getWalletClient } from "@wagmi/core";
import { Confirm, ErrorAlert, EventContainer, msg } from "@common-module/app";
import { BaseContract, Interface, InterfaceAbi, ethers } from "ethers";
import EnvironmentManager from "../EnvironmentManager.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import SwitchToKromaPopup from "../wallet/SwitchToKromaPopup.js";
import WalletManager from "../wallet/WalletManager.js";

export default abstract class Contract<CT extends BaseContract>
  extends EventContainer {
  protected viewContract!: CT;

  private address!: string;

  constructor(private abi: Interface | InterfaceAbi) {
    super();
  }

  public init(address: string) {
    this.address = address;

    this.viewContract = new ethers.Contract(
      this.address,
      this.abi,
      new ethers.JsonRpcProvider(EnvironmentManager.kromaRpc),
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

    if (WalletManager.connected !== true) await WalletManager.connect();

    const walletClient = await getWalletClient();
    if (!walletClient) {
      new ErrorAlert({
        title: msg("no-wallet-connected-title"),
        message: msg("no-wallet-connected-message"),
      });
      throw new Error("No wallet connected");
    }

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

    const { account } = walletClient;
    if (account.address !== KrewSignedUserManager.user?.wallet_address) {
      new ErrorAlert({
        title: msg("wallet-address-mismatch-title"),
        message: msg("wallet-address-mismatch-message"),
      });
      throw new Error("Wallet address mismatch");
    }

    const { chain } = getNetwork();
    if (!chain) {
      new ErrorAlert({
        title: msg("invalid-network-title"),
        message: msg("invalid-network-message"),
      });
      throw new Error("Invalid network");
    }

    if (chain.id !== EnvironmentManager.kromaChainId) {
      await new SwitchToKromaPopup().wait();
    }

    const signer = await KrewSignedUserManager.getContractSigner();
    if (!signer) throw new Error("No signer");

    return new ethers.Contract(this.address, this.abi, signer) as any;
  }
}
