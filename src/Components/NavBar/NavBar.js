import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiSparkles } from 'react-icons/hi';
import './NavBar.css';

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
          <span className="logo-text">DermAid</span>
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
              to="/browse" 
              className={`navbar-link ${location.pathname === '/browse' ? 'active' : ''}`}
            >
              <HiSparkles className="ai-icon" />
              Find More
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
          <li className="navbar-item">
            <Link 
              to="/browse" 
              className={`navbar-link ${location.pathname === '/browse' ? 'active' : ''}`}
            >
              Browse
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;

