import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThreeModel from "../Components/3DModel/ThreeModel";
import {ReactTyped} from 'react-typed';
import { FaStethoscope, FaHeartbeat, FaShieldAlt, FaBrain, FaUserMd, FaSearch } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import './HomePage.css';

function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="landing-page">
      {/* Abstract Background */}
      <div className="abstract-background">
        <div 
          className="gradient-orb orb-1" 
          style={{
            left: `${mousePosition.x * 0.3}%`,
            top: `${mousePosition.y * 0.3}%`,
          }}
        />
        <div 
          className="gradient-orb orb-2" 
          style={{
            left: `${100 - mousePosition.x * 0.2}%`,
            top: `${100 - mousePosition.y * 0.2}%`,
          }}
        />
        <div className="grid-pattern" />
        
        {/* Additional Abstract Shapes Throughout Page */}
        <div className="page-floating-shapes">
          <div className="page-shape page-shape-1" />
          <div className="page-shape page-shape-2" />
          <div className="page-shape page-shape-3" />
          <div className="page-shape page-shape-4" />
          <div className="page-shape page-shape-5" />
          <div className="page-shape page-shape-6" />
        </div>
        
        {/* Floating Particles Throughout Page */}
        <div className="page-particles">
          {[
            { left: '8%', top: '15%' }, { left: '25%', top: '30%' }, { left: '45%', top: '20%' },
            { left: '65%', top: '35%' }, { left: '80%', top: '25%' }, { left: '15%', top: '50%' },
            { left: '35%', top: '60%' }, { left: '55%', top: '55%' }, { left: '75%', top: '65%' },
            { left: '90%', top: '50%' }, { left: '10%', top: '75%' }, { left: '30%', top: '80%' },
            { left: '50%', top: '75%' }, { left: '70%', top: '85%' }, { left: '85%', top: '75%' },
            { left: '20%', top: '10%' }, { left: '40%', top: '5%' }, { left: '60%', top: '12%' },
            { left: '5%', top: '40%' }, { left: '95%', top: '40%' }
          ].map((pos, i) => (
            <div key={i} className="page-particle" style={{ '--delay': `${i * 0.15}s`, '--left': pos.left, '--top': pos.top }} />
          ))}
        </div>
        
        {/* Decorative Lines */}
        <div className="decorative-lines">
          <div className="decorative-line line-1" style={{ '--rotation': '45deg' }} />
          <div className="decorative-line line-2" style={{ '--rotation': '-30deg' }} />
          <div className="decorative-line line-3" style={{ '--rotation': '60deg' }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="landing-content">
        {/* Left Side - Text Content */}
        <div className="landing-left">
          <div className="landing-header">
            <div className="logo-badge">
              <HiSparkles className="sparkle-icon" />
              <span>DermAid</span>
            </div>
            <h1 className="landing-title">
              Your Skin Health
              <br />
              <span className="gradient-text">
                <ReactTyped
                  strings={[
                    'Companion',
                    'Guardian',
                    'Expert',
                    'Partner'
                  ]}
                  typeSpeed={80}
                  backSpeed={50}
                  loop
                />
              </span>
            </h1>
            <p className="landing-subtitle">
              Advanced AI-powered dermatology solutions at your fingertips.
              <br />
              Analyze ingredients, detect concerns, and get expert guidance.
            </p>
          </div>

          {/* Feature Icons */}
          <div className="feature-grid">
            <div className="feature-item">
              <div className="feature-icon">
                <FaStethoscope />
              </div>
              <span>AI Analysis</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <FaShieldAlt />
              </div>
              <span>Safe Ingredients</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <FaBrain />
              </div>
              <span>Smart Detection</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <FaUserMd />
              </div>
              <span>Expert Care</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="cta-buttons">
            <Link to="/ingredient-analyser" className="cta-button primary">
              <FaSearch />
              <span>Get Started</span>
            </Link>
            <Link to="/browse" className="cta-button secondary">
              <span>Find More</span>
            </Link>
          </div>
        </div>

        {/* Right Side - 3D Model */}
        <div className="landing-right">
          <div className="model-container">
            {/* Rotating Facts Title - Above Model */}
            <div className="rotating-facts">
              <div className="facts-label">Did you know?</div>
              <div className="facts-text">
                <ReactTyped
                  strings={[
                    'Your skin is the largest organ in your body, covering about 20 square feet!',
                    'UV protection is crucial - up to 90% of visible skin aging is caused by sun exposure.',
                    'Drinking water helps maintain skin elasticity and hydration from within.',
                    'Regular skin checks can detect early signs of skin cancer, improving treatment success rates.',
                    'The skin renews itself every 28 days, making proper care essential for healthy skin.',
                    'Moisturizing daily helps maintain the skin barrier and prevents dryness.',
                    'SPF 30 blocks about 97% of UVB rays - always wear sunscreen!',
                    'Your skin microbiome contains billions of beneficial bacteria that protect your health.',
                    'Vitamin C and E are powerful antioxidants that help protect skin from environmental damage.',
                    'Early detection of melanoma increases survival rate to over 99%.'
                  ]}
                  typeSpeed={50}
                  backSpeed={30}
                  loop
                  showCursor={true}
                  cursorChar="|"
                />
              </div>
            </div>
            
            {/* Abstract Design Elements */}
            <div className="abstract-shapes">
              <div className="floating-shape shape-1" />
              <div className="floating-shape shape-2" />
              <div className="floating-shape shape-3" />
              <div className="floating-shape shape-4" />
              <div className="floating-shape shape-5" />
            </div>
            <div className="particle-container">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="particle" style={{ '--delay': `${i * 0.2}s` }} />
              ))}
            </div>
            <div className="ring-decoration ring-1" />
            <div className="ring-decoration ring-2" />
            <ThreeModel />
            
            {/* Playful Skin Label */}
            <div className="skin-label">
              <span className="skin-label-text">✨ This is your skin! ✨</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="scroll-arrow" />
        <span>Scroll to explore</span>
      </div>
    </div>
  );
}

export default HomePage;
