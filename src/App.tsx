import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home";
import FAQPage from "./components/FAQPage";
import IngredientsPage from "./components/IngredientsPage";
import OurStoryPage from "./components/OurStoryPage";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/ingredients" element={<IngredientsPage />} />
        <Route path="/our-story" element={<OurStoryPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;