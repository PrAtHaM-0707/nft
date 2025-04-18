import React, { useState, useEffect, useMemo } from "react";
import Navbar from "./Navbar.js";
import NFTTile from "./NFTTile.js";

export default function Marketplace() {
    const sampleData = useMemo(
        () => [
            {
                name: "NFT#1",
                description: "First NFT",
                image: "https://via.placeholder.com/400",
                price: "0.03",
                seller: "0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
                owner: "0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
                tokenId: 1,
            },
        ],
        []
    );
    const [data, updateData] = useState(sampleData);
    const [dataFetched, updateFetched] = useState(false);
    const [loading, setLoading] = useState(false);

    async function getAllNFTs() {
        setLoading(true);
        try {
            const nfts = JSON.parse(localStorage.getItem("mockNFTs") || "[]");
            updateData(nfts.length > 0 ? nfts : sampleData);
            updateFetched(true);
        } catch (error) {
            console.error("Error fetching NFTs:", error);
            updateData(sampleData);
        } finally {
            setLoading(false);
            localStorage.removeItem("refreshNFTs");
        }
    }

    useEffect(() => {
        if (!dataFetched || localStorage.getItem("refreshNFTs") === "true") {
            updateFetched(false);
            getAllNFTs();
        }
    }, [dataFetched]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-black text-white">
            <Navbar />
            <div className="flex flex-col items-center mt-12 px-4">
                <div className="md:text-xl text-lg font-bold text-purple-400 tracking-wide">Top NFTs</div>
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
