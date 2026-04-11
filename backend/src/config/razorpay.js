import Razorpay from "razorpay";
import "dotenv/config";

const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_dummy";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret";

const razorpay = new Razorpay({
    key_id,
    key_secret,
});

export default razorpay;
