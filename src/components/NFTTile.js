import { Link } from "react-router-dom";

function NFTTile({ data }) {
    const newTo = {
        pathname: `/nftPage/${data.tokenId}`,
    };

    // Use placeholder if image is not a valid URL
    const imageUrl = data.image.startsWith("ipfs://")
        ? "https://via.placeholder.com/400" // Placeholder for mock IPFS
        : data.image;

    return (
        <Link to={newTo}>
            <div className="border-2 ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 shadow-2xl">
                <img
                    src={imageUrl}
                    alt={data.name}
                    className="w-72 h-80 rounded-lg object-cover"
                    crossOrigin="anonymous"
                />
                <div className="text-white w-full p-2 bg-gradient-to-t from-[#454545] to-transparent rounded-lg pt-5 -mt-20">
                    <strong className="text-xl">{data.name}</strong>
                    <p className="display-inline">{data.description}</p>
                </div>
            </div>
        </Link>
    );
}

export default NFTTile;
