import initialize from "./initialize.js";
await initialize({
  dev: true,

  supabaseUrl: "http://localhost:54321",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",

  walletConnectProjectId: "9ef2b6a581d3644cd09342a5f0ff5318",
  messageForWalletLinking: "Link Wallet to Krew",

  kromaRpc: "https://api.sepolia.kroma.network",
  kromaChainId: 2358,

  krewPersonalAddress: "0xECFFc91149b8B702dEa6905Ae304A9D36527060F",
  krewCommunalAddress: "0x0",
});
