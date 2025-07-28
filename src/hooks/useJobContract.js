import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { CONTRACT_ADDRESSES, CONTRACT_ABI } from '../lib/web3-config'

export function useJobContract() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  
  // Create assignment with escrow payment
  const createAssignment = async (recruiterAddress, jobId, paymentAmount) => {
    try {
      const result = await writeContract({
        address: CONTRACT_ADDRESSES[31337], // localhost chain id
        abi: CONTRACT_ABI,
        functionName: 'createAssignment',
        args: [recruiterAddress, jobId, Date.now()], // Using timestamp as assignment ID
        value: parseEther(paymentAmount.toString()),
      })
      return { success: true, hash: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Accept assignment (recruiter only)
  const acceptAssignment = async (assignmentId) => {
    try {
      const result = await writeContract({
        address: CONTRACT_ADDRESSES[31337],
        abi: CONTRACT_ABI,
        functionName: 'acceptAssignment',
        args: [assignmentId],
      })
      return { success: true, hash: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Complete assignment and release payment (employer only)
  const completeAssignment = async (assignmentId) => {
    try {
      const result = await writeContract({
        address: CONTRACT_ADDRESSES[31337],
        abi: CONTRACT_ABI,
        functionName: 'completeAssignment',
        args: [assignmentId],
      })
      return { success: true, hash: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return {
    createAssignment,
    acceptAssignment,
    completeAssignment,
    isPending,
    hash
  }
}