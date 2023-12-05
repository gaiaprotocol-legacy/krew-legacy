import { ethers } from "https://esm.sh/ethers@6.7.0";
import KrewCommunalContract from "../_shared/contracts/KrewCommunalContract.ts";
import KrewPersonalContract from "../_shared/contracts/KrewPersonalContract.ts";
import { serveWithOptions } from "../_shared/cors.ts";
import supabase, { getSignedUser } from "../_shared/supabase.ts";
import { getUserWalletAddress } from "../_shared/user.ts";

const provider = new ethers.JsonRpcProvider(Deno.env.get("KROMA_RPC")!);
const signer = new ethers.JsonRpcSigner(provider, ethers.ZeroAddress);
const personalContract = new KrewPersonalContract(signer);
const communalContract = new KrewCommunalContract(signer);

serveWithOptions(async (req) => {
  const { krew } = await req.json();
  if (!krew) throw new Error("Missing subjects");

  const krewId = BigInt(krew.substring(2));

  const user = await getSignedUser(req);
  if (!user) throw new Error("Unauthorized");

  const walletAddress = await getUserWalletAddress(user.id);
  if (!walletAddress) throw new Error("No wallet address");

  const contract = krew.startsWith("c_") ? communalContract : personalContract;

  const [price, balance] = await Promise.all([
    contract.getBuyPrice(krewId, BigInt(1)),
    contract.getBalance(krewId, walletAddress),
  ]);

  const [{ error: detailError }, { error: holderError }] = await Promise.all([
    supabase.from("krews").upsert({
      id: krew,
      last_fetched_key_price: price.toString(),
    }),
    supabase.from("krew_key_holders").upsert({
      krew,
      wallet_address: walletAddress,
      last_fetched_balance: Number(balance),
    }),
  ]);

  if (detailError) throw detailError;
  if (holderError) throw holderError;
});
