// src/components/FeaturedCategories.jsx
const categories = [
  { icon: "🥬", title: "Fresh Vegetables" },
  { icon: "🍊", title: "Fruits" },
  { icon: "⚡", title: "Live Bidding" },
  { icon: "🤖", title: "AI Recommendations" },
]

const FeaturedCategories = () => {
  return (
    <section className="py-10 px-6 bg-white">
      <h2 className="text-3xl font-bold text-center text-ecoGreen mb-8">
        Featured Categories
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
        {categories.map((cat, i) => (
          <div key={i} className="bg-ecoLight rounded-md p-4 text-center shadow-md">
            <div className="text-4xl mb-2">{cat.icon}</div>
            <h3 className="font-semibold text-gray-800">{cat.title}</h3>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FeaturedCategories
