import initialize from "./initialize.js";
await initialize({
  dev: false,

  supabaseUrl: "https://sfwnwiuxgehxbyystchq.supabase.co",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmd253aXV4Z2VoeGJ5eXN0Y2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAyMTA5OTYsImV4cCI6MjAxNTc4Njk5Nn0.iQ9aIdYmqKOdeAXonb6LFy9DLSVMlWycxleueEIOZes",

  walletConnectProjectId: "9ef2b6a581d3644cd09342a5f0ff5318",
  messageForWalletLinking: "Link Wallet to Krew",

  kromaRpc: "https://api.kroma.network",
  kromaChainId: 255,

  krewPersonalAddress: "0xECFFc91149b8B702dEa6905Ae304A9D36527060F",
  krewCommunalAddress: "0x0",

  faceWalletApiKey:
    "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD-mCDG60gguwgoqPDhzxWfNFOsY0DDSytnxp2QH0cNrwUHFeL6dq2cOAFHiUR_92ja0MUs1t-7Jvu02Yfx7lCEBfaxniCusVOPWhCH8VSvVvIQSX18f6TaaldlMIy4H_CjEXn2aPhdRHoZLWfno7uZ67E3rSkv-S0oBzCGT6VYPwIDAQAB",
});
