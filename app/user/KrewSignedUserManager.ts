import { getNetwork, getWalletClient } from "@wagmi/core";
import { Supabase } from "common-app-module";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { SignedUserManager, SoFiUserPublic } from "sofi-module";
import EnvironmentManager from "../EnvironmentManager.js";
import WalletManager from "../wallet/WalletManager.js";
import KrewUserCacher from "./KrewUserCacher.js";
import KrewUserService from "./KrewUserService.js";

class KrewSignedUserManager extends SignedUserManager<SoFiUserPublic> {
  protected async fetchUser(userId: string) {
    const user = await KrewUserService.fetchUser(userId);
    if (user) KrewUserCacher.cache(user);
    return user;
  }

  public async signIn() {
    await Supabase.signIn("twitter");
  }

  public async linkWallet() {
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
      KrewUserCacher.cache(this.user);
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
      return new JsonRpcSigner(
        new BrowserProvider(transport, {
          chainId: chain.id,
          name: chain.name,
          ensAddress: chain.contracts?.ensRegistry?.address,
        }),
        account.address,
      );
    }
  }
}

export default new KrewSignedUserManager();
