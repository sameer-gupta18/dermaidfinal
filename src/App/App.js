import './App.css';
import NavBar from '../Components/NavBar/NavBar';
import IngredientAnalyser from '../IngredientAnalyser/IngredientAnalyser';
import HomePage from '../HomePage/HomePage';
import MelanomaAnalyser from '../MelanomaAnalyser/MelanomaAnalyser';
import AskGPT from '../AskGPT/AskGPT';
import FindDermatologist from '../FindDermatologist/FindDermatologist';
import Browse from '../Browse/Browse';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';

function FloatingFindMoreButton() {
  const location = useLocation();
  if (location.pathname === '/find-more') return null;
  return (
    <Link to="/find-more" className="floating-find-more">
      Find More →
    </Link>
  );
}

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <FloatingFindMoreButton />
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/ingredient-analyser" element={<IngredientAnalyser/>}/>
        <Route path="/melanoma-analyser" element={<MelanomaAnalyser/>}/>
        <Route path="/find-more" element={<AskGPT/>}/>
        <Route path="/find-dermatologist" element={<FindDermatologist/>}/>
        <Route path="/browse" element={<Browse/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
