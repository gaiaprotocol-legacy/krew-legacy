import { Supabase } from "@common-module/app";
import { SignedUserManager } from "@common-module/social";
import { getNetwork, getWalletClient } from "@wagmi/core";
import { ethers } from "ethers";
import EnvironmentManager from "../EnvironmentManager.js";
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
    if (!WalletManager.connected) await WalletManager.connect();

    const walletAddress = WalletManager.address;
    if (!walletAddress) throw new Error("Wallet is not connected");

    const { data: nonceData, error: nonceError } = await Supabase.client
      .functions.invoke("new-wallet-linking-nonce", {
        body: { walletAddress },
      });
    if (nonceError) throw nonceError;

    const signedMessage = await WalletManager.signMessage(
      `${EnvironmentManager.messageForWalletLinking}\n\nNonce: ${nonceData.nonce}`,
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

  public async getContractSigner() {
    if (!this.user) throw new Error("User not signed in");
    if (WalletManager.connected !== true) {
      throw new Error("Wallet not connected");
    }
    if (!this.user.wallet_address) throw new Error("Wallet not linked");

    const walletClient = await getWalletClient();
    if (!walletClient) throw new Error("Wallet not connected");
    const { account, transport } = walletClient;

    if (account.address !== this.user.wallet_address) {
      throw new Error("Wallet address mismatch");
    }

    const { chain } = getNetwork();
    if (!chain) throw new Error("Chain not found");
    if (chain.id !== EnvironmentManager.kromaChainId) {
      throw new Error("Wrong chain");
    }

    if (chain && account && transport) {
      const provider = new ethers.providers.Web3Provider(transport, {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
      });
      return provider.getSigner(account.address);
    }
  }
}

export default new KrewSignedUserManager();
