import initialize from "./initialize.js";
await initialize({
  dev: true,

  supabaseUrl: "https://sfwnwiuxgehxbyystchq.supabase.co",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmd253aXV4Z2VoeGJ5eXN0Y2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAyMTA5OTYsImV4cCI6MjAxNTc4Njk5Nn0.iQ9aIdYmqKOdeAXonb6LFy9DLSVMlWycxleueEIOZes",

  walletConnectProjectId: "9ef2b6a581d3644cd09342a5f0ff5318",
  messageForWalletLinking: "Link Wallet to Krew",

  kromaRpc: "https://api.sepolia.kroma.network",
  kromaChainId: 2358,

  krewPersonalAddress: "0xECFFc91149b8B702dEa6905Ae304A9D36527060F",
  krewCommunalAddress: "0xe741b5DF37FB86eaB58F616dA0f4BfF10251C37a",
});
