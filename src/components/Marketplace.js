
import React, { useState, useEffect, useMemo } from "react";
import Navbar from "./Navbar.js";
import NFTTile from "./NFTTile.js";

export default function Marketplace() {
    const sampleData = useMemo(
        () => [
            {
                name: "NFT#1",
                description: "Alchemy's First NFT",
                image: "https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
                price: "0.03",
                seller: "0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
                owner: "0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
                tokenId: 1,
            },
            {
                name: "NFT#2",
                description: "Alchemy's Second NFT",
                image: "https://gateway.pinata.cloud/ipfs/QmdhoL9K8my2vi3fej97foiqGmJ389SMs55oC5EdkrxF2M",
                price: "0.03",
                seller: "0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
                owner: "0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
                tokenId: 2,
            },
            {
                name: "NFT#3",
                description: "Alchemy's Third NFT",
                image: "https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
                price: "0.03",
                seller: "0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
                owner: "0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
                tokenId: 3,
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
            const nfts = JSON.parse(localStorage.getItem('mockNFTs') || '[]');
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

    return React.createElement(
        "div",
        { className: "min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-black text-white" },
        React.createElement(Navbar, null),
        React.createElement(
            "div",
            { className: "flex flex-col items-center mt-12 px-4" },
            React.createElement(
                "div",
                { className: "md:text-xl text-lg font-bold text-purple-400 tracking-wide" },
                "Top NFTs"
            ),
            loading
                ? React.createElement(
                      "div",
                      { className: "mt-6 text-gray-300 text-lg" },
                      "Loading NFTs..."
                  )
                : React.createElement(
                      "div",
                      { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 max-w-7xl w-full" },
                      data.map((value, index) =>
                          React.createElement(
                              "div",
                              {
                                  key: index,
                                  className: "transform transition-transform duration-300 hover:scale-105",
                              },
                              React.createElement(NFTTile, { data: value })
                          )
                      )
                  )
        )
    );
}
