import TopProducts from "../components/TopProducts"
import HeroSection from "../components/HeroSection";
import FeaturedCategories from "../components/FeaturedCategories";
import BiddingPreview from "../components/BiddingPreview";

const Home = () => {
  return (
    <div>
      <HeroSection />
      <FeaturedCategories />
      <BiddingPreview />
      <TopProducts />
    </div>
  )
}

export default Home;