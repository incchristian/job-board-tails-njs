const { ethers } = require("hardhat");

async function main() {
  // Get the contract
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const JobAssignmentContract = await ethers.getContractFactory("JobAssignmentContract");
  const contract = JobAssignmentContract.attach(contractAddress);
  
  // Get signers (test accounts)
  const [employer, recruiter] = await ethers.getSigners();
  
  console.log("Testing JobAssignmentContract...");
  console.log("Employer:", employer.address);
  console.log("Recruiter:", recruiter.address);
  
  // Test 1: Create assignment
  console.log("\n1. Creating assignment...");
  const jobId = 1;
  const offChainAssignmentId = 123;
  const payment = ethers.parseEther("1.0"); // 1 ETH payment
  
  const tx1 = await contract.connect(employer).createAssignment(
    recruiter.address,
    jobId,
    offChainAssignmentId,
    { value: payment }
  );
  
  const receipt1 = await tx1.wait();
  console.log("Assignment created! Transaction:", receipt1.hash);
  
  // Test 2: Get assignment details
  console.log("\n2. Getting assignment details...");
  const assignment = await contract.getAssignment(1);
  console.log("Assignment:", {
    id: assignment.id.toString(),
    employer: assignment.employer,
    recruiter: assignment.recruiter,
    jobId: assignment.jobId.toString(),
    payment: ethers.formatEther(assignment.payment),
    status: assignment.status
  });
  
  // Test 3: Recruiter accepts assignment
  console.log("\n3. Recruiter accepting assignment...");
  const tx2 = await contract.connect(recruiter).acceptAssignment(1);
  await tx2.wait();
  console.log("Assignment accepted!");
  
  // Test 4: Check updated status
  const updatedAssignment = await contract.getAssignment(1);
  console.log("Updated status:", updatedAssignment.status);
  
  console.log("\n✅ All tests passed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });