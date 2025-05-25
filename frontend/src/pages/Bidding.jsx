import React from "react";
import BiddingCard from "../components/BiddingCard";

const dummyBiddingData = [
  {
    id: 1,
    name: "Fresh Mangoes",
    image: "/images/mango.jpg", // Replace with your image path
    highestBid: 250,
    biddingEndTime: "2025-05-22T18:30:00Z"
  },
  {
    id: 2,
    name: "Organic Tomatoes",
    image: "/images/tomato.jpg",
    highestBid: 180,
    biddingEndTime: "2025-05-22T19:00:00Z"
  }
];

const Bidding = () => {
  return (
    <div className="px-6 py-10">
      <h2 className="text-3xl font-bold mb-6 text-center">Live Bidding</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {dummyBiddingData.map((item) => (
          <BiddingCard key={item.id} product={item} />
        ))}
      </div>
    </div>
  );
};

export default Bidding;
