import Navbar from "./Navbar";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect } from "react";
import NFTTile from "./NFTTile";

export default function Profile() {
    const [nfts, setNfts] = useState([]);
    const [fetched, setFetched] = useState(false);
    const [wallet, setWallet] = useState(localStorage.getItem("walletAddress") || "0x");
    const [totalValue, setTotalValue] = useState("0");

    async function fetchNFTs() {
        try {
            const ethers = require("ethers");
            let valueAccumulator = 0;

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const storedAddress = localStorage.getItem("walletAddress");
            const userAddress = storedAddress || (await signer.getAddress());

            const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
            const listedItems = await contract.getMyNFTs();

            const nftList = await Promise.all(
                listedItems.map(async (item) => {
                    const tokenURI = await contract.tokenURI(item.tokenId);
                    const meta = (await axios.get(tokenURI)).data;

                    const ethPrice = ethers.utils.formatUnits(item.price.toString(), 'ether');
                    valueAccumulator += parseFloat(ethPrice);

                    return {
                        tokenId: item.tokenId.toNumber(),
                        name: meta.name,
                        description: meta.description,
                        image: meta.image,
                        price: ethPrice,
                        owner: item.owner,
                        seller: item.seller,
                    };
                })
            );

            setWallet(userAddress);
            setTotalValue(valueAccumulator.toFixed(3));
            setNfts(nftList);
            setFetched(true);
        } catch (error) {
            console.error("Error fetching NFTs:", error);
            setNfts([]);
            setTotalValue("0");
            setFetched(true);
        }
    }

    useEffect(() => {
        if (!fetched) {
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
