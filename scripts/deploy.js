const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying JobAssignmentContract...");
  
  const JobAssignmentContract = await ethers.getContractFactory("JobAssignmentContract");
  const contract = await JobAssignmentContract.deploy();
  
  await contract.waitForDeployment();
  
  console.log("JobAssignmentContract deployed to:", await contract.getAddress());
  console.log("Transaction hash:", contract.deploymentTransaction().hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });