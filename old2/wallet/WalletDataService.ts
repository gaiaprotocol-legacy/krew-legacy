import { SupabaseService } from "@common-module/app";
import WalletData from "../database-interface/WalletData.js";

class WalletService extends SupabaseService<WalletData> {
  constructor() {
    super("wallets", "*", 50);
  }

  public async fetch(walletAddress: string): Promise<WalletData | undefined> {
    return await this.safeSelectSingle((b) =>
      b.eq("wallet_address", walletAddress)
    );
  }
}

export default new WalletService();
