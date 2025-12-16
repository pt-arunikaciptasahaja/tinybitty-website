import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home";
import FAQPage from "./components/FAQPage";
import IngredientsPage from "./components/IngredientsPage";
import OurStoryPage from "./components/OurStoryPage";
import NotFound from "./components/NotFound";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <div className="global-container">
      <ScrollToTop />
      <Suspense fallback={<p>Loading...</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/ingredients" element={<IngredientsPage />} />
          <Route path="/our-story" element={<OurStoryPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;