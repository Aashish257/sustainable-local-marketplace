import React, { useState } from "react";
import CountdownTimer from "./CountdownTimer";

const BiddingCard = ({ product }) => {
  const [showModal, setShowModal] = useState(false);
  const [bidAmount, setBidAmount] = useState("");

  const handleBidSubmit = () => {
    if (parseInt(bidAmount) <= product.highestBid) {
      alert("Please enter a higher bid.");
      return;
    }

    // Handle real submission logic here
    alert(`Bid of ₹${bidAmount} placed on ${product.name}`);
    setShowModal(false);
    setBidAmount("");
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-2">
          Highest Bid: ₹<span className="font-bold">{product.highestBid}</span>
        </p>
        <CountdownTimer endTime={product.biddingEndTime} />
        <button
          className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors duration-300"
          onClick={() => setShowModal(true)}
        >
          Place Bid
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-[90%] sm:w-96">
            <h2 className="text-xl font-bold mb-4">Place Your Bid</h2>
            <input
              type="number"
              placeholder="Enter amount (₹)"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleBidSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Submit Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiddingCard;
