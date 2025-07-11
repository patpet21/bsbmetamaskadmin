import { ethers } from "ethers";

// Token configurations for Base mainnet
export const PRDX_TOKEN = {
  address: '0x61dd008f1582631aa68645ff92a1a5ecaedbed19',
  decimals: 18,
  symbol: 'PRDX',
};

export const USDC_TOKEN = {
  address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  decimals: 6,
  symbol: 'USDC',
};

export const RECIPIENT_ADDRESS = '0x7fDECF16574bd21Fd5cce60B701D01A6F83826ab';

export const BASE_CHAIN_ID = 8453;

// ERC20 ABI for token transfers
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

export interface WalletConnection {
  address: string;
  provider: ethers.BrowserProvider;
  signer: ethers.JsonRpcSigner;
}

export async function connectWallet(): Promise<WalletConnection> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Check if we're on Base mainnet
    const network = await provider.getNetwork();
    if (network.chainId !== BigInt(BASE_CHAIN_ID)) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          // Chain not added to MetaMask
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
                chainName: "Base",
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://mainnet.base.org"],
                blockExplorerUrls: ["https://basescan.org"],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    }

    return {
      address: accounts[0],
      provider,
      signer,
    };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
}

export async function sendTokenPayment(
  connection: WalletConnection,
  tokenSymbol: "PRDX" | "USDC",
  amountUSD: number
): Promise<string> {
  const token = tokenSymbol === "PRDX" ? PRDX_TOKEN : USDC_TOKEN;
  
  try {
    const tokenContract = new ethers.Contract(
      token.address,
      ERC20_ABI,
      connection.signer
    );

    // Convert USD amount to token amount based on decimals
    // Note: In a real app, you'd need to get the current token/USD rate
    // For this demo, we'll assume 1 token = 1 USD for simplicity
    const tokenAmount = ethers.parseUnits(amountUSD.toString(), token.decimals);

    // Check balance
    const balance = await tokenContract.balanceOf(connection.address);
    if (balance < tokenAmount) {
      throw new Error(`Insufficient ${token.symbol} balance`);
    }

    // Send transaction
    const tx = await tokenContract.transfer(RECIPIENT_ADDRESS, tokenAmount);
    
    // Wait for confirmation
    await tx.wait();
    
    return tx.hash;
  } catch (error) {
    console.error("Error sending token payment:", error);
    throw error;
  }
}

export function formatTokenAmount(amount: string, decimals: number): string {
  return ethers.formatUnits(amount, decimals);
}

export function parseTokenAmount(amount: string, decimals: number): bigint {
  return ethers.parseUnits(amount, decimals);
}

// Type augmentation for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
