import Navbar from "./Navbar.js";
import NFTTile from "./NFTTile.js";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect, useCallback, useMemo } from "react";
import { GetIpfsUrlFromPinata } from "../utils";

export default function Marketplace() {
    const sampleData = useMemo(
        () => [
            {
                name: "NFT#1",
                description: "Alchemy's First NFT",
                website: "http://axieinfinity.io",
                image: "https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
                price: "0.03",
                currentlySelling: "True",
                address: "0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
            },
            {
                name: "NFT#2",
                description: "Alchemy's Second NFT",
                website: "http://axieinfinity.io",
                image: "https://gateway.pinata.cloud/ipfs/QmdhoL9K8my2vi3fej97foiqGmJ389SMs55oC5EdkrxF2M",
                price: "0.03",
                currentlySelling: "True",
                address: "0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
            },
            {
                name: "NFT#3",
                description: "Alchemy's Third NFT",
                website: "http://axieinfinity.io",
                image: "https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
                price: "0.03",
                currentlySelling: "True",
                address: "0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
            },
        ],
        []
    );
    const [data, updateData] = useState(sampleData);
    const [dataFetched, updateFetched] = useState(false);
    const [loading, setLoading] = useState(false);

    // Toggle this to match SellNFT.js for mock mode
    const useMock = true; // Set to true for testing/demo purposes

    const getAllNFTs = useCallback(async () => {
        setLoading(true);
        try {
            if (useMock) {
                // Use mock NFTs from localStorage
                const mockNFTs = JSON.parse(localStorage.getItem('mockNFTs') || '[]');
                updateData(mockNFTs.length > 0 ? mockNFTs : sampleData);
                updateFetched(true);
            } else {
                const ethers = require("ethers");
                if (!window.ethereum) throw new Error("MetaMask not detected");
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
                let transaction = await contract.getAllNFTs();

                const items = await Promise.all(
                    transaction.map(async (i) => {
                        const tokenURI = await contract.tokenURI(i.tokenId);
                        console.log("getting this tokenUri", tokenURI);
                        const ipfsUrl = GetIpfsUrlFromPinata(tokenURI);
                        const meta = await axios.get(ipfsUrl);
                        const price = ethers.utils.formatUnits(i.price.toString(), "ether");
                        return {
                            price,
                            tokenId: i.tokenId.toNumber(),
                            seller: i.seller,
                            owner: i.owner,
                            image: meta.data.image,
                            name: meta.data.name,
                            description: meta.data.description,
                        };
                    })
                );

                updateFetched(true);
                updateData(items);
            }
        } catch (error) {
            console.error("Error fetching NFTs:", error);
            updateData(sampleData);
        } finally {
            setLoading(false);
            localStorage.removeItem("refreshNFTs");
        }
    }, [sampleData]);

    useEffect(() => {
        if (!dataFetched || localStorage.getItem("refreshNFTs") === "true") {
            updateFetched(false);
            getAllNFTs();
        }
    }, [dataFetched, getAllNFTs]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-black text-white">
            <Navbar />
            <div className="flex flex-col items-center mt-12 px-4">
                <div className="md:text-xl text-lg font-bold text-purple-400 tracking-wide">
                    Top NFTs
                </div>
                {loading ? (
                    <div className="mt-6 text-gray-300 text-lg">Loading NFTs...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 max-w-7xl w-full">
                        {data.map((value, index) => (
                            <div
                                key={index}
                                className="transform transition-transform duration-300 hover:scale-105"
                            >
                                <NFTTile data={value} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
