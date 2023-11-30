import { getNetwork, getWalletClient } from "@wagmi/core";
import { Confirm, ErrorAlert, EventContainer, msg } from "common-app-module";
import { BaseContract, ethers, Interface, InterfaceAbi } from "ethers";
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

  protected async getWriteContract(): Promise<CT | undefined> {
    if (!KrewSignedUserManager.signed) {
      new Confirm({
        title: msg("not-signed-in-title"),
        message: msg("not-signed-in-message"),
        confirmTitle: msg("not-signed-in-confirm"),
      }, () => KrewSignedUserManager.signIn());
      return;
    }

    if (WalletManager.connected !== true) await WalletManager.connect();

    const walletClient = await getWalletClient();
    if (!walletClient) {
      new ErrorAlert({
        title: msg("no-wallet-connected-title"),
        message: msg("no-wallet-connected-message"),
      });
      return;
    }

    if (!KrewSignedUserManager.user?.wallet_address) {
      new Confirm({
        title: msg("no-wallet-linked-title"),
        message: msg("no-wallet-linked-message"),
        confirmTitle: msg("no-wallet-linked-confirm"),
      }, () => KrewSignedUserManager.linkWallet());
      return;
    }

    const { account } = walletClient;
    if (account.address !== KrewSignedUserManager.user.wallet_address) {
      new ErrorAlert({
        title: msg("wallet-address-mismatch-title"),
        message: msg("wallet-address-mismatch-message"),
      });
      return;
    }

    const { chain } = getNetwork();
    if (!chain) {
      new ErrorAlert({
        title: msg("invalid-network-title"),
        message: msg("invalid-network-message"),
      });
      return;
    }

    if (chain.id !== EnvironmentManager.kromaChainId) {
      new SwitchToKromaPopup();
      return;
    }

    const signer = await KrewSignedUserManager.getContractSigner();
    if (signer) {
      return new ethers.Contract(this.address, this.abi, signer) as any;
    }
  }
}
