import Navbar from "./Navbar";
import { useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";

export default function NFTPage(props) {
    const [data, updateData] = useState({});
    const [dataFetched, updateDataFetched] = useState(false);
    const [message, updateMessage] = useState("");
    const [currAddress, updateCurrAddress] = useState("0x");

    async function getNFTData(tokenId) {
        const ethers = require("ethers");
        try {
            if (!window.ethereum) throw new Error("MetaMask not detected");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const addr = await signer.getAddress();
            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
            const tokenURI = await contract.tokenURI(tokenId);
            const listedToken = await contract.getListedTokenForId(tokenId);
            const ipfsUrl = GetIpfsUrlFromPinata(tokenURI);
            const meta = await axios.get(ipfsUrl);
            console.log(listedToken);

            const item = {
                price: meta.data.price,
                tokenId: tokenId,
                seller: listedToken.seller,
                owner: listedToken.owner,
                image: meta.data.image,
                name: meta.data.name,
                description: meta.data.description,
            };
            console.log(item);
            updateData(item);
            updateDataFetched(true);
            console.log("address", addr);
            updateCurrAddress(addr);
        } catch (e) {
            console.error("Error fetching NFT data:", e);
            updateMessage("Failed to load NFT data. Please try again.");
        }
    }

    async function buyNFT(tokenId) {
        try {
            const ethers = require("ethers");
            if (!window.ethereum) throw new Error("MetaMask not detected");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
            const salePrice = ethers.utils.parseUnits(data.price, 'ether');
            updateMessage("Buying the NFT... Please Wait (Up to 5 mins)");
            const transaction = await contract.executeSale(tokenId, { value: salePrice });
            await transaction.wait();
            updateMessage("You successfully bought the NFT!");
            setTimeout(() => updateMessage(""), 3000); // Clear message after 3 seconds
        } catch (e) {
            console.error("Purchase error:", e);
            updateMessage("Failed to buy NFT: " + e.message);
            setTimeout(() => updateMessage(""), 5000); // Clear error after 5 seconds
        }
    }

    const params = useParams();
    const tokenId = params.tokenId;
    if (!dataFetched) getNFTData(tokenId);
    if (typeof data.image === "string") data.image = GetIpfsUrlFromPinata(data.image);

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
                        {currAddress !== data.owner && currAddress !== data.seller ? (
                            <button
                                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-2 px-4 rounded text-sm hover:shadow-lg transition duration-200"
                                onClick={() => buyNFT(tokenId)}
                            >
                                Buy this NFT
                            </button>
                        ) : (
                            <div className="text-green-400 font-semibold">You are the owner of this NFT</div>
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