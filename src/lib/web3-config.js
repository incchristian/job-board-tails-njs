import { createConfig, http } from 'wagmi'
import { polygon, polygonMumbai, localhost } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

const config = getDefaultConfig({
  appName: 'Job Board',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  chains: [localhost, polygonMumbai, polygon],
})

export default config

// Contract addresses
export const CONTRACT_ADDRESSES = {
  [localhost.id]: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Your deployed local contract
  [polygonMumbai.id]: '0x...', // Will be filled after Mumbai deployment
  [polygon.id]: '0x...', // Will be filled after mainnet deployment
}

export const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "assignmentId",
        "type": "uint256"
      }
    ],
    "name": "AssignmentAccepted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "assignmentId",
        "type": "uint256"
      }
    ],
    "name": "AssignmentCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "assignmentId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "employer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "recruiter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "jobId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "payment",
        "type": "uint256"
      }
    ],
    "name": "AssignmentCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "assignmentId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "recruiter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "PaymentReleased",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_assignmentId",
        "type": "uint256"
      }
    ],
    "name": "acceptAssignment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "assignmentCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "assignments",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "employer",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "recruiter",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "jobId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "payment",
        "type": "uint256"
      },
      {
        "internalType": "enum JobAssignmentContract.AssignmentStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "completedAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_assignmentId",
        "type": "uint256"
      }
    ],
    "name": "completeAssignment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_recruiter",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_jobId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_offChainAssignmentId",
        "type": "uint256"
      }
    ],
    "name": "createAssignment",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_assignmentId",
        "type": "uint256"
      }
    ],
    "name": "getAssignment",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "employer",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "recruiter",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "jobId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "payment",
            "type": "uint256"
          },
          {
            "internalType": "enum JobAssignmentContract.AssignmentStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "completedAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct JobAssignmentContract.Assignment",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]