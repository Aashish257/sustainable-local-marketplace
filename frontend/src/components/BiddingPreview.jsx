// src/components/LiveBiddingPreview.jsx

import React from "react";
import { useNavigate } from "react-router-dom";

const dummyBids = [
  {
    id: 1,
    product: "Organic Tomatoes",
    image: "https://plus.unsplash.com/premium_photo-1671395501275-630ae5ea02c4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dG9tYXRvfGVufDB8fDB8fHww",
    highestBid: "₹75/kg",
    endsIn: "10m",
  },
  {
    id: 2,
    product: "Fresh Carrots",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8RnJlc2glMjBDYXJyb3RzfGVufDB8fDB8fHww",
    highestBid: "₹60/kg",
    endsIn: "15m",
  },
  {
    id: 3,
    product: "Golden Mangoes",
    image: "https://images.unsplash.com/photo-1591424238566-00d60a5342b0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fEdvbGRlbiUyME1hbmdvZXN8ZW58MHx8MHx8fDA%3D",
    highestBid: "₹120/kg",
    endsIn: "5m",
  },
];

const BiddingPreview = () => {
  const navigate = useNavigate();

  return (
    <div className="py-16 bg-white px-6 md:px-20">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
        🔥 Live Bidding Now
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {dummyBids.map((bid) => (
          <div
            key={bid.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300"
          >
            <img src={bid.image} alt={bid.product} className="h-48 w-full object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold">{bid.product}</h3>
              <p className="text-gray-600">Highest Bid: {bid.highestBid}</p>
              <p className="text-sm text-red-500">Ends in: {bid.endsIn}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-8">
        <button
          onClick={() => navigate("/bidding")}
          className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition"
        >
          Join Live Bidding
        </button>
      </div>
    </div>
  );
};

export default BiddingPreview;
