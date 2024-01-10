import initialize from "./initialize.js";
await initialize({
  dev: false,

  /*supabaseUrl: "http://localhost:54321",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",

  walletConnectProjectId: "9ef2b6a581d3644cd09342a5f0ff5318",
  messageForWalletLinking: "Link Wallet to Krew",

  kromaRpc: "https://api.sepolia.kroma.network",
  kromaChainId: 2358,

  krewPersonalAddress: "0xECFFc91149b8B702dEa6905Ae304A9D36527060F",
  krewCommunalAddress: "0x0",

  faceWalletApiKey:
    "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCabnLsk0vauF2YhaKrovsi6VvfjNLlb0IY5WdySMiNoAf_gtxHFiBCS4XXI3bctLEM4GZ81GcUwlIaXOrE3V-1hV9dqI-vC_UBMQf-aeEMWQp4lgtP7j2egUf-tZxswNeYRxSfVzZeN4no5UhV8EQcQpxAc3Urdi1Oj-8j22QNIQIDAQAB",*/

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
