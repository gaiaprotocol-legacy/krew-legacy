import { Supabase } from "@common-module/app";
import { SignedUserManager } from "@common-module/social";
import { ethers } from "ethers";
import Env from "../Env.js";
import KrewUserPublic from "../database-interface/KrewUserPublic.js";
import WalletManager from "../wallet/WalletManager.js";
import KrewUserService from "./KrewUserService.js";

class KrewSignedUserManager extends SignedUserManager<KrewUserPublic> {
  protected async fetchUser(userId: string) {
    return await KrewUserService.fetchUser(userId);
  }

  public get walletLinked() {
    return this.user?.wallet_address !== undefined;
  }

  public async signIn() {
    await Supabase.signIn("twitter");
  }

  public async linkWallet() {
    if (!await WalletManager.connected()) await WalletManager.connect();

    const walletAddress = await WalletManager.getAddress();
    if (!walletAddress) throw new Error("Wallet is not connected");

    const { data: nonceData, error: nonceError } = await Supabase.client
      .functions.invoke("new-wallet-linking-nonce", {
        body: { walletAddress },
      });
    if (nonceError) throw nonceError;

    const signedMessage = await WalletManager.signMessage(
      `${Env.messageForWalletLinking}\n\nNonce: ${nonceData.nonce}`,
    );

    const { error: linkError } = await Supabase.client.functions
      .invoke(
        "link-wallet-to-user",
        { body: { walletAddress, signedMessage } },
      );
    if (linkError) throw linkError;

    if (this.user) {
      this.user.wallet_address = walletAddress;
      this.fireEvent("walletLinked");
    }
  }

  public async getContractSigner(): Promise<ethers.providers.JsonRpcSigner> {
    if (!this.user) throw new Error("User not signed in");
    if (await WalletManager.connected() !== true) {
      throw new Error("Wallet not connected");
    }
    if (!this.user.wallet_address) throw new Error("Wallet not linked");
    if (await WalletManager.getAddress() !== this.user.wallet_address) {
      throw new Error("Wallet address mismatch");
    }
    if (await WalletManager.getChainId() !== Env.kromaChainId) {
      throw new Error("Wrong chain");
    }
    return await WalletManager.getSigner();
  }
}

export default new KrewSignedUserManager();
