import initialize from "./initialize.js";
await initialize({
  dev: true,

  supabaseUrl: "",
  supabaseAnonKey: "",

  walletConnectProjectId: "9ef2b6a581d3644cd09342a5f0ff5318",
  messageForWalletLinking: "Link Wallet to Krew",

  kromaRpc: "https://api.kroma.network",
  kromaChainId: 255,

  krewPersonalAddress: "0x0",
  krewCommunalAddress: "0x0",
});
