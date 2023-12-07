import initialize from "./initialize.js";
await initialize({
  dev: true,

  supabaseUrl: "https://nvpcdfjnookurpbeixkt.supabase.co",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cGNkZmpub29rdXJwYmVpeGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE5NTkyNTUsImV4cCI6MjAxNzUzNTI1NX0.55I5dRBCvMR1DoZ94Nf0PASTyLRURHWcP8-uGP1zlns",

  walletConnectProjectId: "9ef2b6a581d3644cd09342a5f0ff5318",
  messageForWalletLinking: "Link Wallet to Krew",

  kromaRpc: "https://api.kroma.network",
  kromaChainId: 255,

  krewPersonalAddress: "0xECFFc91149b8B702dEa6905Ae304A9D36527060F",
  krewCommunalAddress: "0x0",
});
