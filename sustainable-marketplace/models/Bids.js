const mongoose = require("mongoose");

const BidSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  },
  buyerId: { type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  bidAmount: { type: Number, 
    required: true 
  },
}, 
{ 
  timestamps: true 
});

module.exports = mongoose.model("Bid", BidSchema);
