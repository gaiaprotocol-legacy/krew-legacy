require("@nomiclabs/hardhat-ethers");

async function main() {
  const KrewPersonal = await ethers.getContractFactory("KrewPersonal");
  console.log("Deploying KrewPersonal to ", network.name);

  const [account1] = await ethers.getSigners();

  const krewPersonal = await upgrades.deployProxy(
    KrewPersonal,
    [
      account1.address,
      BigInt("50000000000000000"),
      BigInt("50000000000000000"),
    ],
    {
      initializer: "initialize",
    },
  );
  await krewPersonal.waitForDeployment();

  console.log("KrewPersonal deployed to:", krewPersonal.target);
}

main();
