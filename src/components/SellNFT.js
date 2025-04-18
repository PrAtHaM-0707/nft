```javascript
import Navbar from "./Navbar.js";
import { useState } from "react";

export default function SellNFT() {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: '' });
    const [file, setFile] = useState(null);
    const [message, updateMessage] = useState('');

    async function disableButton() {
        const listButton = document.getElementById("list-button");
        listButton.disabled = true;
        listButton.className = "font-bold w-full bg-gray-600 text-white rounded-lg py-2 transition duration-300 shadow-md opacity-50 cursor-not-allowed";
    }

    async function enableButton() {
        const listButton = document.getElementById("list-button");
        listButton.disabled = false;
        listButton.className = "font-bold w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 transition duration-300 shadow-md";
    }

    function handleFileChange(e) {
        const selectedFile = e.target.files[0];
        if (!selectedFile) {
            updateMessage("No file selected. Please choose an image.");
            return;
        }

        // Validate file size (500 KB limit)
        if (selectedFile.size > 500 * 1024) {
            updateMessage("File size exceeds 500 KB. Please choose a smaller image.");
            return;
        }

        // Validate file type (only images)
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(selectedFile.type)) {
            updateMessage("Invalid file type. Please upload a JPEG, PNG, or GIF image.");
            return;
        }

        setFile(selectedFile);
        updateMessage("");
    }

    async function listNFT(e) {
        e.preventDefault();
        const { name, description, price } = formParams;
        if (!name || !description || !price || !file) {
            updateMessage("Please fill all the fields and select an image!");
            return;
        }

        const storedAddress = localStorage.getItem("walletAddress");
        if (!storedAddress) {
            updateMessage("No wallet connected. Please connect in Navbar.");
            return;
        }

        try {
            disableButton();
            updateMessage("Listing NFT... Please wait!");

            // Create mock NFT data
            const mockImageURL = `ipfs://mock-cid-${Date.now()}/${file.name}`;
            const nftData = {
                name,
                description,
                price,
                image: mockImageURL,
                seller: storedAddress,
                owner: storedAddress,
                tokenId: Date.now(), // Unique ID for demo
            };

            // Store in localStorage
            const nfts = JSON.parse(localStorage.getItem('mockNFTs') || '[]');
            nfts.push(nftData);
            localStorage.setItem('mockNFTs', JSON.stringify(nfts));

            updateMessage("Successfully listed your NFT!");
            enableButton();
            updateFormParams({ name: '', description: '', price: '' });
            setFile(null);
            localStorage.setItem('refreshNFTs', 'true'); // Signal refresh
            setTimeout(() => {
                updateMessage("");
                window.location.replace("/");
            }, 3000);
        } catch (e) {
            console.error("Error listing NFT:", e);
            updateMessage("Failed to list NFT: " + e.message);
            enableButton();
            setTimeout(() => updateMessage(""), 5000);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-black text-white">
            <Navbar />
            <div className="flex flex-col items-center mt-12 px-4">
                <form className="bg-[#1a1a1a] shadow-lg rounded-2xl px-8 pt-6 pb-8 w-full max-w-md border border-purple-800">
                    <h3 className="text-center text-xl font-bold text-purple-400 mb-6">
                        Upload your NFT to the marketplace
                    </h3>

                    <div className="mb-4">
                        <label className="block text-purple-300 text-sm font-semibold mb-2" htmlFor="name">
                            NFT Name
                        </label>
                        <input
                            className="bg-gray-700 text-white border border-gray-600 rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            id="name"
                            type="text"
                            placeholder="Axie#4563"
                            onChange={e => updateFormParams({ ...formParams, name: e.target.value })}
                            value={formParams.name}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-purple-300 text-sm font-semibold mb-2" htmlFor="description">
                            NFT Description
                        </label>
                        <textarea
                            className="bg-gray-700 text-white border border-gray-600 rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            cols="40"
                            rows="3"
                            id="description"
                            placeholder="Axie Infinity Collection"
                            onChange={e => updateFormParams({ ...formParams, description: e.target.value })}
                            value={formParams.description}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-purple-300 text-sm font-semibold mb-2" htmlFor="price">
                            Price (in ETH)
                        </label>
                        <input
                            className="bg-gray-700 text-white border border-gray-600 rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            type="number"
                            placeholder="Min 0.01 ETH"
                            step="0.01"
                            onChange={e => updateFormParams({ ...formParams, price: e.target.value })}
                            value={formParams.price}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-purple-300 text-sm font-semibold mb-2" htmlFor="image">
                            Upload Image (<500 KB)
                        </label>
                        <input
                            className="text-white"
                            type="file"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className={`text-center text-sm mb-4 ${message.includes("Failed") ? "text-red-400" : "text-green-400"}`}>
                        {message}
                    </div>

                    <button
                        onClick={listNFT}
                        className="font-bold w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 transition duration-300 shadow-md"
                        id="list-button"
                    >
                        List NFT
                    </button>
                </form>
            </div>
        </div>
    );
}
```
