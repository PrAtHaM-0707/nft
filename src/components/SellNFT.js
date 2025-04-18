import Navbar from "./Navbar.jsx";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from '../Marketplace.json';

export default function SellNFT() {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: '' });
    const [fileURL, setFileURL] = useState(null);
    const [message, updateMessage] = useState('');
    const [uploadStatus, setUploadStatus] = useState(null); 
    const ethers = require("ethers");

    // Toggle this to false to use real Pinata uploads (requires valid Pinata API credentials)
    const useMock = true; // Set to true for testing/demo purposes

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

    async function mockUploadFileToIPFS(file) {
        // Simulate a delay for the upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Randomly succeed or fail for demo purposes (80% success rate)
        const isSuccess = Math.random() < 0.8;
        if (isSuccess) {
            return {
                success: true,
                pinataURL: `ipfs://mock-cid-${Date.now()}/${file.name}`
            };
        } else {
            throw new Error("Mock upload failed");
        }
    }

    async function mockUploadJSONToIPFS(json) {
        // Simulate a delay for the upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Randomly succeed or fail for demo purposes (80% success rate)
        const isSuccess = Math.random() < 0.8;
        if (isSuccess) {
            return {
                success: true,
                pinataURL: `ipfs://mock-cid-${Date.now()}/metadata.json`
            };
        } else {
            throw new Error("Mock metadata upload failed");
        }
    }

    async function OnChangeFile(e) {
        const file = e.target.files[0];
        if (!file) {
            updateMessage("No file selected. Please choose an image.");
            setUploadStatus('failed');
            return;
        }

        // Validate file size (500 KB limit)
        if (file.size > 500 * 1024) {
            updateMessage("File size exceeds 500 KB. Please choose a smaller image.");
            setUploadStatus('failed');
            enableButton();
            return;
        }

        // Validate file type (only images)
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(file.type)) {
            updateMessage("Invalid file type. Please upload a JPEG, PNG, or GIF image.");
            setUploadStatus('failed');
            enableButton();
            return;
        }

        try {
            disableButton();
            updateMessage("Uploading image to Pinata... Please wait!");
            setUploadStatus(null);
            const response = useMock ? await mockUploadFileToIPFS(file) : await uploadFileToIPFS(file);
            if (response.success === true) {
                enableButton();
                updateMessage("Image uploaded successfully!");
                setUploadStatus('success');
                console.log(`${useMock ? "Mock" : "Uploaded"} image to Pinata: `, response.pinataURL);
                setFileURL(response.pinataURL);
                setTimeout(() => updateMessage(""), 3000);
            } else {
                throw new Error("Pinata upload failed");
            }
        } catch (e) {
            console.error(`Error during ${useMock ? "mock" : "file"} upload:`, e);
            updateMessage(`Failed to upload image: ${e.message}`);
            setUploadStatus('failed');
            enableButton();
            setTimeout(() => updateMessage(""), 5000);
        }
    }

    async function uploadMetadataToIPFS() {
        const { name, description, price } = formParams;
        if (!name || !description || !price || !fileURL) {
            updateMessage("Please fill all the fields!");
            return -1;
        }

        const nftJSON = { name, description, price, image: fileURL };

        try {
            const response = useMock ? await mockUploadJSONToIPFS(nftJSON) : await uploadJSONToIPFS(nftJSON);
            if (response.success === true) {
                console.log(`${useMock ? "Mock" : "Uploaded"} JSON to Pinata: `, response);
                return response.pinataURL;
            }
            return -1;
        } catch (e) {
            console.error(`Error uploading ${useMock ? "mock" : "JSON"} metadata:`, e);
            updateMessage("Failed to upload metadata. Please try again.");
            return -1;
        }
    }

    async function listNFT(e) {
        e.preventDefault();
        try {
            const metadataURL = await uploadMetadataToIPFS();
            if (metadataURL === -1) return;

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const storedAddress = localStorage.getItem("walletAddress");
            if (!storedAddress) {
                updateMessage("No wallet connected. Please connect in Navbar.");
                return;
            }

            disableButton();
            updateMessage("Listing NFT... Please wait (up to 5 mins)");

            let contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
            const price = ethers.utils.parseUnits(formParams.price, 'ether');
            let listingPrice = await contract.getListPrice();
            listingPrice = listingPrice.toString();
            if (useMock) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                console.log("Mock NFT listed with metadata:", metadataURL);
            } else {
                let transaction = await contract.createToken(metadataURL, price, { value: listingPrice });
                await transaction.wait();
            }

            updateMessage("Successfully listed your NFT!");
            enableButton();
            updateFormParams({ name: '', description: '', price: '' });
            setFileURL(null);
            setUploadStatus(null);
            localStorage.setItem('refreshNFTs', 'true');
            setTimeout(() => {
                updateMessage("");
                window.location.replace("/");
            }, 3000);
        } catch (e) {
            console.error(`${useMock ? "Mock" : "Upload"} error:`, e);
            updateMessage(`Failed to list NFT: ${e.message}`);
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
                            onChange={OnChangeFile}
                        />
                        {uploadStatus === 'success' && (
                            <div className="flex items-center mt-2 text-green-400">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Pinata Upload Verified
                            </div>
                        )}
                        {uploadStatus === 'failed' && (
                            <div className="flex items-center mt-2 text-red-400">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Pinata Upload Failed
                            </div>
                        )}
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
