// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract JobAssignmentContract {
    struct Assignment {
        uint256 id;
        address employer;
        address recruiter;
        uint256 jobId;
        uint256 payment;
        AssignmentStatus status;
        uint256 createdAt;
        uint256 completedAt;
    }
    
    enum AssignmentStatus {
        PENDING,
        ACCEPTED,
        COMPLETED,
        CANCELLED,
        DISPUTED
    }
    
    mapping(uint256 => Assignment) public assignments;
    uint256 public assignmentCounter;
    
    event AssignmentCreated(uint256 indexed assignmentId, address indexed employer, address indexed recruiter, uint256 jobId, uint256 payment);
    event AssignmentAccepted(uint256 indexed assignmentId);
    event AssignmentCompleted(uint256 indexed assignmentId);
    event PaymentReleased(uint256 indexed assignmentId, address indexed recruiter, uint256 amount);
    
    modifier onlyEmployer(uint256 _assignmentId) {
        require(assignments[_assignmentId].employer == msg.sender, "Only employer can call this");
        _;
    }
    
    modifier onlyRecruiter(uint256 _assignmentId) {
        require(assignments[_assignmentId].recruiter == msg.sender, "Only recruiter can call this");
        _;
    }
    
    // Employer creates assignment with escrow payment
    function createAssignment(
        address _recruiter,
        uint256 _jobId,
        uint256 _offChainAssignmentId
    ) external payable {
        require(msg.value > 0, "Payment must be greater than 0");
        require(_recruiter != address(0), "Invalid recruiter address");
        
        assignmentCounter++;
        
        assignments[assignmentCounter] = Assignment({
            id: _offChainAssignmentId,
            employer: msg.sender,
            recruiter: _recruiter,
            jobId: _jobId,
            payment: msg.value,
            status: AssignmentStatus.PENDING,
            createdAt: block.timestamp,
            completedAt: 0
        });
        
        emit AssignmentCreated(assignmentCounter, msg.sender, _recruiter, _jobId, msg.value);
    }
    
    // Recruiter accepts assignment
    function acceptAssignment(uint256 _assignmentId) external onlyRecruiter(_assignmentId) {
        require(assignments[_assignmentId].status == AssignmentStatus.PENDING, "Assignment not pending");
        
        assignments[_assignmentId].status = AssignmentStatus.ACCEPTED;
        emit AssignmentAccepted(_assignmentId);
    }
    
    // Employer marks assignment as completed and releases payment
    function completeAssignment(uint256 _assignmentId) external onlyEmployer(_assignmentId) {
        require(assignments[_assignmentId].status == AssignmentStatus.ACCEPTED, "Assignment not accepted");
        
        assignments[_assignmentId].status = AssignmentStatus.COMPLETED;
        assignments[_assignmentId].completedAt = block.timestamp;
        
        // Release payment to recruiter
        uint256 payment = assignments[_assignmentId].payment;
        address recruiter = assignments[_assignmentId].recruiter;
        
        (bool success, ) = recruiter.call{value: payment}("");
        require(success, "Payment transfer failed");
        
        emit AssignmentCompleted(_assignmentId);
        emit PaymentReleased(_assignmentId, recruiter, payment);
    }
    
    // Get assignment details
    function getAssignment(uint256 _assignmentId) external view returns (Assignment memory) {
        return assignments[_assignmentId];
    }
}