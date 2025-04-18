import fullLogo from "../full_logo.png";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

function Navbar() {
  const [connected, toggleConnect] = useState(false);
  const [currAddress, updateAddress] = useState(localStorage.getItem("walletAddress") || "0x");
  const [isConnecting, setIsConnecting] = useState(false);
  const location = useLocation();

  async function getAddress() {
    try {
      const ethers = require("ethers");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const addr = await signer.getAddress();
      updateAddress(addr);
      localStorage.setItem("walletAddress", addr);
      toggleConnect(true);
    } catch (error) {
      console.error("Error fetching address:", error);
      updateAddress("0x");
      localStorage.removeItem("walletAddress");
      toggleConnect(false);
    }
  }

  async function connectWebsite() {
    setIsConnecting(true);
    try {
      // Prompt user for wallet address
      const userInput = prompt("Please enter your wallet address:");
      if (!userInput) {
        throw new Error("No address provided");
      }

      // Basic validation for Ethereum address
      const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(userInput);
      if (!isValidAddress) {
        throw new Error("Invalid wallet address format");
      }

      updateAddress(userInput);
      localStorage.setItem("walletAddress", userInput);
      toggleConnect(true);

      // Existing MetaMask connection logic
      if (window.ethereum) {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        if (chainId !== "0x8274f") {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x8274f" }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x8274f",
                    chainName: "Sepolia Test Network",
                    nativeCurrency: {
                      name: "Sepolia ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: ["https://rpc.sepolia.org"],
                    blockExplorerUrls: ["https://sepolia.etherscan.io"],
                  },
                ],
              });
              await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x8274f" }],
              });
            } else {
              throw switchError;
            }
          }
        }

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length > 0) {
          await getAddress();
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      updateAddress("0x");
      localStorage.removeItem("walletAddress");
      toggleConnect(false);
      alert(error.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }

  useEffect(() => {
    // Check for stored wallet address on mount
    const storedAddress = localStorage.getItem("walletAddress");
    if (storedAddress) {
      updateAddress(storedAddress);
      toggleConnect(true);
    }

    if (!window.ethereum) return;

    const checkConnection = async () => {
      try {
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          await getAddress();
        } else {
          toggleConnect(!!storedAddress);
          updateAddress(storedAddress || "0x");
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    };

    checkConnection();

    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        getAddress();
      } else {
        toggleConnect(!!localStorage.getItem("walletAddress"));
        updateAddress(localStorage.getItem("walletAddress") || "0x");
      }
    });

    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });

    return () => {
      window.ethereum.removeAllListeners("accountsChanged");
      window.ethereum.removeAllListeners("chainChanged");
    };
  }, []);

  return (
    <div className="bg-gray-900 text-white shadow-md">
      <nav className="w-full px-6 py-3">
        <div className="flex flex-col lg:flex-row justify-between items-center">
          <li className="flex items-center space-x-3 list-none">
            <Link to="/" className="flex items-center space-x-2">
             <span className="font-bold text-xl">NFT Marketplace</span>
            </Link>
          </li>

          <ul className="flex flex-wrap justify-center lg:justify-end items-center gap-6 font-semibold text-lg mt-4 lg:mt-0">
            <li
              className={
                location.pathname === "/"
                  ? "border-b-2 border-white pb-1"
                  : "hover:border-b-2 hover:pb-1 border-gray-500"
              }
            >
              <Link to="/">Marketplace</Link>
            </li>
            <li
              className={
                location.pathname === "/sellNFT"
                  ? "border-b-2 border-white pb-1"
                  : "hover:border-b-2 hover:pb-1 border-gray-500"
              }
            >
              <Link to="/sellNFT">List My NFT</Link>
            </li>
            <li
              className={
                location.pathname === "/profile"
                  ? "border-b-2 border-white pb-1"
                  : "hover:border-b-2 hover:pb-1 border-gray-500"
              }
            >
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <button
                className={`enableEthereumButton text-white font-bold py-2 px-4 rounded text-sm transition duration-200 flex items-center justify-center ${
                  isConnecting
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-700 shadow-lg cursor-not-allowed"
                    : connected
                    ? "bg-gradient-to-r from-green-500 to-green-700 shadow-lg"
                    : "bg-gradient-to-r from-blue-500 to-blue-700 shadow-lg"
                }`}
                onClick={connectWebsite}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Connecting...
                  </>
                ) : connected ? (
                  "Connected"
                ) : (
                  "Connect Wallet"
                )}
              </button>
            </li>
          </ul>
        </div>
      </nav>
      <div className="text-white font-mono text-sm pr-10 pb-2 text-right">
        {currAddress !== "0x" ? (
          <span className="group relative">
            Connected to {currAddress.substring(0, 6)}...{currAddress.slice(-4)}
            <span className="absolute hidden group-hover:block bg-gray-800 text-xs p-2 rounded mt-1">
              {currAddress}
            </span>
          </span>
        ) : (
          "Not Connected. Please login to view NFTs"
        )}
      </div>
    </div>
  );
}

export default Navbar;
