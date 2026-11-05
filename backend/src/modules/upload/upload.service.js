import crypto from "crypto";
import { AppError } from "../../utils/AppError.js";

// Signed direct upload: the browser sends the file straight to Cloudinary,
// so large files never pass through our API. The API secret never leaves the server.
const config = () => ({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
});

export const isUploadConfigured = () => {
    const { cloudName, apiKey, apiSecret } = config();
    return Boolean(cloudName && apiKey && apiSecret);
};

// Cloudinary rule: sort params by key, join as k=v with "&", append the secret, SHA-1 hex.
export const signParams = (params, apiSecret) => {
    const toSign = Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join("&");
    return crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
};

export const createUploadSignature = (userId) => {
    if (!isUploadConfigured()) {
        throw new AppError("Image upload is not configured. Paste an image URL instead.", 503);
    }
    const { cloudName, apiKey, apiSecret } = config();
    // Each seller uploads into their own folder; timestamp makes the signature expire (~1h on Cloudinary)
    const params = { folder: `products/${userId}`, timestamp: Math.floor(Date.now() / 1000) };
    return {
        ...params,
        cloudName,
        apiKey,
        signature: signParams(params, apiSecret),
        uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    };
};
