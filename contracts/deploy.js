const { ethers } = require("hardhat");

async function main() {
  const JobAssignmentContract = await ethers.getContractFactory("JobAssignmentContract");
  const contract = await JobAssignmentContract.deploy();
  
  await contract.deployed();
  
  console.log("JobAssignmentContract deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });