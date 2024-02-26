export default interface Config {
  dev: boolean;

  supabaseUrl: string;
  supabaseAnonKey: string;

  walletConnectProjectId: string;
  messageForWalletLinking: string;

  kromaRpc: string;
  kromaChainId: number;

  krewPersonalAddress: string;
  krewCommunalAddress: string;

  faceWalletApiKey: string;
}
