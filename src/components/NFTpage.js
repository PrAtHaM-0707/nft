import Navbar from "./Navbar";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

export default function NFTPage() {
    const [data, updateData] = useState({});
    const [dataFetched, updateDataFetched] = useState(false);
    const [message, updateMessage] = useState("");
    const [currAddress, updateCurrAddress] = useState(localStorage.getItem("walletAddress") || "0x");

    const params = useParams();
    const tokenId = params.tokenId;

    function getNFTData(tokenId) {
        try {
            const nfts = JSON.parse(localStorage.getItem("mockNFTs") || "[]");
            const nft = nfts.find((item) => item.tokenId === parseInt(tokenId));
            if (!nft) {
                throw new Error("NFT not found");
            }
            // Use a placeholder image or convert File to URL if needed
            updateData({
                ...nft,
                image: nft.image || "https://via.placeholder.com/400", // Placeholder if no image
            });
            updateDataFetched(true);
            updateCurrAddress(localStorage.getItem("walletAddress") || "0x");
        } catch (e) {
            console.error("Error fetching NFT data:", e);
            updateMessage("Failed to load NFT data. Please try again.");
        }
    }

    async function buyNFT(tokenId) {
        try {
            if (!currAddress || currAddress === "0x") {
                throw new Error("Please connect your wallet");
            }
            if (currAddress === data.owner || currAddress === data.seller) {
                throw new Error("You already own or are selling this NFT");
            }

            updateMessage("Buying the NFT... Please wait!");
            const nfts = JSON.parse(localStorage.getItem("mockNFTs") || "[]");
            const updatedNFTs = nfts.map((nft) =>
                nft.tokenId === parseInt(tokenId)
                    ? { ...nft, owner: currAddress, seller: "" } // Update owner, clear seller
                    : nft
            );
            localStorage.setItem("mockNFTs", JSON.stringify(updatedNFTs));
            localStorage.setItem("refreshNFTs", "true"); // Signal refresh for Marketplace and Profile

            updateMessage("You successfully bought the NFT!");
            setTimeout(() => {
                updateMessage("");
                window.location.replace("/profile"); // Redirect to Profile
            }, 3000);
        } catch (e) {
            console.error("Purchase error:", e);
            updateMessage("Failed to buy NFT: " + e.message);
            setTimeout(() => updateMessage(""), 5000);
        }
    }

    useEffect(() => {
        if (!dataFetched && tokenId) {
            getNFTData(tokenId);
        }
    }, [dataFetched, tokenId]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-black text-white">
            <Navbar />
            <div className="flex flex-col md:flex-row max-w-7xl mx-auto px-4 mt-12 gap-8">
                <img
                    src={data.image}
                    alt={data.name || "NFT"}
                    className="w-full md:w-2/5 rounded-lg shadow-lg object-cover"
                />
                <div className="bg-[#1a1a1a] rounded-lg border border-purple-800 p-6 shadow-lg w-full md:w-3/5 space-y-6">
                    <h2 className="text-2xl font-semibold text-purple-400">{data.name}</h2>
                    <p className="text-gray-300"><strong>Description:</strong> {data.description}</p>
                    <p className="text-gray-300"><strong>Price:</strong> <span>{data.price} ETH</span></p>
                    <p className="text-gray-300"><strong>Owner:</strong> <span className="text-sm font-mono">{data.owner}</span></p>
                    <p className="text-gray-300"><strong>Seller:</strong> <span className="text-sm font-mono">{data.seller}</span></p>
                    <div>
                        {currAddress !== data.owner && currAddress !== data.seller && currAddress !== "0x" ? (
                            <button
                                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-2 px-4 rounded text-sm hover:shadow-lg transition duration-200"
                                onClick={() => buyNFT(tokenId)}
                            >
                                Buy this NFT
                            </button>
                        ) : (
                            <div className="text-green-400 font-semibold">
                                {currAddress === "0x" ? "Please connect your wallet" : "You are the owner or seller of this NFT"}
                            </div>
                        )}
                    </div>
                    {message && (
                        <div className={`text-center text-sm ${message.includes("Failed") ? "text-red-400" : "text-green-400"}`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
