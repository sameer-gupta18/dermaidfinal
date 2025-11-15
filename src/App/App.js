import './App.css';
import IngredientAnalyser
 from '../IngredientAnalyser/IngredientAnalyser';
import HomePage from '../HomePage/HomePage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/ingredient-analyser" element={<IngredientAnalyser/>}/>
      
    </Routes>
    </BrowserRouter>
  );
}

export default App;
