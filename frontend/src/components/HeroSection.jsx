const HeroSection = () => {
  return (
    <div
      className="relative bg-cover bg-center py-28 px-6 text-center text-white"
      style={{ backgroundImage: "url('/assets/farm-hero.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
          Empowering Farmers, Connecting Communities
        </h1>
        <p className="text-lg md:text-xl mb-8 drop-shadow">
          Fresh local produce, real-time bidding, AI-powered recommendations.
        </p>
        <div className="space-x-4">
          <button className="bg-white text-green-600 font-semibold py-3 px-8 rounded-lg hover:bg-green-100 transition-all duration-300 shadow-md">
            Shop Now
          </button>
          <button className="bg-green-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md">
            Become a Seller
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
