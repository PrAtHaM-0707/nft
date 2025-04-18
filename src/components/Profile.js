import Navbar from "./Navbar";
import { useState, useEffect } from "react";
import NFTTile from "./NFTTile";

export default function Profile() {
    const [nfts, setNfts] = useState([]);
    const [fetched, setFetched] = useState(false);
    const [wallet, setWallet] = useState(localStorage.getItem("walletAddress") || "0x");
    const [totalValue, setTotalValue] = useState("0");

    async function fetchNFTs() {
        try {
            const nfts = JSON.parse(localStorage.getItem("mockNFTs") || "[]");
            const userAddress = localStorage.getItem("walletAddress") || "0x";
            const userNFTs = nfts.filter((nft) => nft.owner === userAddress || nft.seller === userAddress);
            const valueAccumulator = userNFTs.reduce((sum, nft) => sum + parseFloat(nft.price || 0), 0);

            setWallet(userAddress);
            setTotalValue(valueAccumulator.toFixed(3));
            setNfts(userNFTs);
            setFetched(true);
            localStorage.removeItem("refreshNFTs"); // Clear refresh flag
        } catch (error) {
            console.error("Error fetching NFTs:", error);
            setNfts([]);
            setTotalValue("0");
            setFetched(true);
        }
    }

    useEffect(() => {
        if (!fetched || localStorage.getItem("refreshNFTs") === "true") {
            setFetched(false);
            fetchNFTs();
        }
    }, [fetched]);

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white">
            <Navbar />
            <div className="max-w-7xl mx-auto py-12 px-4">
                <div className="bg-[#1a1a1a] rounded-xl p-6 mb-10 shadow-lg border border-purple-800">
                    <h1 className="text-3xl font-semibold text-purple-400 mb-2">Welcome Back, Creator!</h1>
                    <p className="text-sm break-all text-gray-300 mb-1"><strong>Connected Wallet:</strong> {wallet}</p>
                    <div className="flex gap-8 mt-4 text-lg">
                        <p><strong>NFTs Owned:</strong> {nfts.length}</p>
                        <p><strong>Total Holdings:</strong> {totalValue} ETH</p>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-purple-300 mb-6">Your NFT Collection</h2>
                    {nfts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {nfts.map((nft, index) => (
                                <NFTTile key={index} data={nft} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-red-400 mt-8 text-center text-lg">
                            No NFTs found. Have you connected your wallet?
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
