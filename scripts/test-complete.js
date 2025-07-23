require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    polygonMumbai: {
      url: "https://rpc.ankr.com/polygon_mumbai",
      accounts: [process.env.PRIVATE_KEY],
    },
    polygon: {
      url: "https://polygon-rpc.com",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY,
  },
};

const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const JobAssignmentContract = await ethers.getContractFactory("JobAssignmentContract");
  const contract = JobAssignmentContract.attach(contractAddress);
  
  const [employer, recruiter] = await ethers.getSigners();
  
  console.log("Testing payment completion...");
  
  // Check recruiter balance before
  const balanceBefore = await ethers.provider.getBalance(recruiter.address);
  console.log("Recruiter balance before:", ethers.formatEther(balanceBefore), "ETH");
  
  // Employer completes the assignment (releases payment)
  console.log("\nCompleting assignment...");
  const tx = await contract.connect(employer).completeAssignment(1);
  await tx.wait();
  console.log("Assignment completed!");
  
  // Check recruiter balance after
  const balanceAfter = await ethers.provider.getBalance(recruiter.address);
  console.log("Recruiter balance after:", ethers.formatEther(balanceAfter), "ETH");
  
  // Check final status
  const finalAssignment = await contract.getAssignment(1);
  console.log("Final status:", finalAssignment.status); // Should be 2 (COMPLETED)
  
  console.log("\n✅ Payment released successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });