require("@nomiclabs/hardhat-ethers");

async function main() {
  const deployedProxyAddress = process.env.KREW_COMMUNAL_ADDRESS;

  const KrewCommunalUpgrade = await ethers.getContractFactory(
    "KrewCommunal",
  );
  console.log("Upgrading KrewCommunal...");

  await upgrades.upgradeProxy(deployedProxyAddress, KrewCommunalUpgrade);
  console.log("KrewCommunal upgraded");
}

main();
