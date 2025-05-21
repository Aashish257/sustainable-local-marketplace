// src/components/TopProducts.jsx
const products = [
  { name: "Fresh Vegetables", price: "₹35/kg", image: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHZlZ2V0YWJsZXxlbnwwfHwwfHx8MA%3D%3D" },
  { name: "Fruits", price: "₹25/kg", image: "https://plus.unsplash.com/premium_photo-1671379086168-a5d018d583cf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZnJ1aXRzfGVufDB8fDB8fHww" },
  { name: "Fresh Spinach", price: "₹40/kg", image: "https://images.unsplash.com/photo-1683536905403-ea18a3176d29?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8RnJlc2glMjBTcGluYWNofGVufDB8fDB8fHww" },
  { name: "Organic Bananas", price: "₹60/dozen", image: "https://images.unsplash.com/photo-1744659753302-9f4fc320f085?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fE9yZ2FuaWMlMjBCYW5hbmFzfGVufDB8fDB8fHww" },
  { name: "Apple", price: "₹60/kg", image: "https://images.unsplash.com/photo-1576179635662-9d1983e97e1e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFwcGxlfGVufDB8fDB8fHww"},
]

const TopProducts = () => {
  return (
    <section className="py-10 px-6 bg-gray-50">
      <h2 className="text-3xl font-bold text-center text-ecoGreen mb-8">Top Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {products.map((product, i) => (
          <div
            key={i}
            className="bg-white rounded-md overflow-hidden shadow hover:shadow-lg transition"
          >
            <img
              src={product.image}
              alt={product.name}
              className="h-40 w-full object-cover"
            />
            <div className="p-4 text-center">
              <h3 className="font-semibold text-gray-800">{product.name}</h3>
              <p className="text-ecoGreen font-medium">{product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TopProducts
