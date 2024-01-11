import { ErrorAlert, EventContainer, msg } from "@common-module/app";
import {
  configureChains,
  createConfig,
  getAccount,
  getNetwork,
  getWalletClient,
  signMessage,
  switchNetwork,
  watchAccount,
} from "@wagmi/core";
import { kroma, kromaSepolia } from "@wagmi/core/chains";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/html";
import { ethers } from "ethers";
import Env from "../Env.js";
import InternalWalletManager from "./InternalWalletManager.js";

class WalletConnectManager extends EventContainer
  implements InternalWalletManager {
  private web3modal!: Web3Modal;
  private _resolveConnection?: () => void;
  private _connected = false;

  public async connected(): Promise<boolean> {
    return this._connected;
  }

  private get address() {
    return getAccount().address;
  }

  public async getAddress() {
    return this.address;
  }

  public async getChainId() {
    return getNetwork().chain?.id;
  }

  constructor() {
    super();
    this.addAllowedEvents("accountChanged");
  }

  public init(projectId: string) {
    const chains = [kroma, kromaSepolia];

    const { publicClient } = configureChains(chains, [
      w3mProvider({ projectId }),
    ]);

    const wagmiConfig = createConfig({
      autoConnect: true,
      connectors: w3mConnectors({ projectId, chains }),
      publicClient,
    });

    const ethereumClient = new EthereumClient(wagmiConfig, chains);

    this.web3modal = new Web3Modal({
      projectId,
      themeMode: "dark",
      themeVariables: {
        "--w3m-accent-color": "#25D366",
        "--w3m-background-color": "#25D366",
        "--w3m-z-index": "999999",
      },
    }, ethereumClient);

    this._connected = this.address !== undefined;

    let cachedAddress = this.address;
    watchAccount((account) => {
      this._connected = account.address !== undefined;
      if (this._connected && this._resolveConnection) {
        this._resolveConnection();
      }
      if (cachedAddress !== account.address) {
        this.fireEvent("accountChanged");
        cachedAddress = account.address;
      }
    });
  }

  public async connect() {
    if (this.address !== undefined) {
      this._connected = true;
      this.fireEvent("accountChanged");
    }
    return new Promise<void>((resolve) => {
      this._resolveConnection = resolve;
      this.web3modal.openModal();
    });
  }

  public async signMessage(message: string) {
    if (!this.address) throw new Error("Wallet is not connected");
    return await signMessage({ message });
  }

  public async switchToKroma() {
    await switchNetwork({ chainId: Env.kromaChainId });
  }

  public async getSigner(): Promise<ethers.providers.JsonRpcSigner> {
    if (this._connected !== true) await this.connect();

    const walletClient = await getWalletClient();
    if (!walletClient) {
      new ErrorAlert({
        title: msg("no-wallet-connected-title"),
        message: msg("no-wallet-connected-message"),
      });
      throw new Error("No wallet connected");
    }

    const { chain } = getNetwork();
    if (!chain) {
      new ErrorAlert({
        title: msg("invalid-network-title"),
        message: msg("invalid-network-message"),
      });
      throw new Error("Invalid network");
    }

    const provider = new ethers.providers.Web3Provider(walletClient.transport, {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    });
    return provider.getSigner(walletClient.account.address);
  }
}

export default new WalletConnectManager();
