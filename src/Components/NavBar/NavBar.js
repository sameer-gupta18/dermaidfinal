import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiSparkles } from 'react-icons/hi';
import './NavBar.css';
import logo from '../../assets/logo.png'
function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      // Check if scrolled past 100px (landing page area)
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    // Check initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt = 'Logo'/>
        </Link>
        
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link 
              to="/" 
              className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home Page
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/ingredient-analyser" 
              className={`navbar-link ${location.pathname === '/ingredient-analyser' ? 'active' : ''}`}
            >
              <HiSparkles className="ai-icon" />
              Ingredient Analyser
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/melanoma-analyser" 
              className={`navbar-link ${location.pathname === '/melanoma-analyser' ? 'active' : ''}`}
            >
              <HiSparkles className="ai-icon" />
              Melanoma Analyser
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/skin-care-generator" 
              className={`navbar-link ${location.pathname === '/skin-care-generator' ? 'active' : ''}`}
            >
              <HiSparkles className="ai-icon" />
              Skin Care
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/find-dermatologist" 
              className={`navbar-link ${location.pathname === '/find-dermatologist' ? 'active' : ''}`}
            >
              Find Nearest Dermatologist
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;

