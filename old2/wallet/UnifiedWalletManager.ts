import { EventContainer } from "@common-module/app";
import FaceWalletManager from "./FaceWalletManager.js";
import WalletConnectManager from "./WalletConnectManager.js";
import WalletManager from "./WalletManager.js";

const wallets: WalletManager[] = [FaceWalletManager, WalletConnectManager];

class UnifiedWalletManager extends EventContainer {
  public async findWallet(
    address: string,
    chainId: number,
  ): Promise<WalletManager | undefined> {
    const found = await Promise.all(
      wallets.map(async (wallet) => {
        return {
          wallet,
          address: await wallet.getAddress(),
          chainId: await wallet.getChainId(),
        };
      }),
    );
    const exact = found.find((w) => {
      return w.address === address && w.chainId === chainId;
    });
    if (exact) return exact.wallet;
    const sameAddress = found.find((w) => w.address === address);
    if (sameAddress) {
      await sameAddress.wallet.switchToKroma();
      if (await sameAddress.wallet.getChainId() === chainId) {
        return sameAddress.wallet;
      }
    }
  }
}

export default new UnifiedWalletManager();
