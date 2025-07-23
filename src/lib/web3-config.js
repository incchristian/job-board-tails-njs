import { createConfig, http } from 'wagmi'
import { polygon, polygonMumbai } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

const config = getDefaultConfig({
  appName: 'Job Board',
  projectId: '88d21c4f2058c791b8f26d3aadcfb6d3', // Get from https://cloud.walletconnect.com
  chains: [polygonMumbai, polygon], // Start with Mumbai testnet
  transports: {
    [polygonMumbai.id]: http(),
    [polygon.id]: http(),
  },
})

export default config

// Contract addresses (deploy contract first)
export const CONTRACT_ADDRESSES = {
  [polygonMumbai.id]: '0x...', // Will be filled after deployment
  [polygon.id]: '0x...', // Will be filled after deployment
}

export const CONTRACT_ABI = [
  // Add your contract ABI here after compilation
]