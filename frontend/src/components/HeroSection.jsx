export default function HeroSection() {
  return (
    <section className="bg-green-100 p-10 text-center">
      <h1 className="text-4xl font-bold text-green-900">Empowering Farmers, Connecting Communities.</h1>
      <p className="mt-4 text-lg text-green-800">Fresh produce from your local farmer is just a click away.</p>
      <div className="mt-6 space-x-4">
        <button className="bg-green-700 text-white px-6 py-2 rounded">Shop Now</button>
        <button className="border border-green-700 text-green-700 px-6 py-2 rounded">Become a Seller</button>
      </div>
    </section>
  );
}