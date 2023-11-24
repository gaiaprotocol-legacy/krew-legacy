require("@nomiclabs/hardhat-ethers");

async function main() {
  const KrewCommunal = await ethers.getContractFactory("KrewCommunal");
  console.log("Deploying KrewCommunal to ", network.name);

  const [account1] = await ethers.getSigners();

  const krewCommunal = await upgrades.deployProxy(
    KrewCommunal,
    [
      account1.address,
      BigInt("50000000000000000"),
      BigInt("50000000000000000"),
    ],
    {
      initializer: "initialize",
    },
  );
  await krewCommunal.waitForDeployment();

  console.log("KrewCommunal deployed to:", krewCommunal.target);
}

main();
