require("@nomiclabs/hardhat-ethers");

async function main() {
  const deployedProxyAddress = process.env.KREW_PERSONAL_ADDRESS;

  const KrewPersonalUpgrade = await ethers.getContractFactory(
    "KrewPersonal",
  );
  console.log("Upgrading KrewPersonal...");

  await upgrades.upgradeProxy(deployedProxyAddress, KrewPersonalUpgrade);
  console.log("KrewPersonal upgraded");
}

main();
