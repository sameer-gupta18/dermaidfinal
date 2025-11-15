import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThreeModel from "../Components/3DModel/ThreeModel";

import { ReactTyped } from 'react-typed';
import { FaStethoscope, FaShieldAlt, FaBrain, FaUserMd, FaSearch, FaSun, FaHandHoldingHeart, FaLeaf } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import './HomePage.css';
import healthy from '../assets/normal_skin.webp'
import dry from '../assets/dry_skin.webp'
import hyper from '../assets/hyperpigmentation_skin.jpg'
import acne from '../assets/acne_skin.jpg'

function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const sliders = [
    { id: 'dry', title: 'See how dryness changes healthy skin', normal: healthy, condition: dry },
    { id: 'acne', title: 'Compare healthy vs acne-prone skin', normal: healthy, condition: acne },
    { id: 'redness', title: 'See irritation and redness appear', normal: healthy, condition: hyper },
  ];

  return (
    <>
      <div className="landing-page">
        {/* Abstract Background */}
        <div className="abstract-background">
          <div className="gradient-orb orb-1" style={{ left: `${mousePosition.x * 0.3}%`, top: `${mousePosition.y * 0.3}%` }} />
          <div className="gradient-orb orb-2" style={{ left: `${100 - mousePosition.x * 0.2}%`, top: `${100 - mousePosition.y * 0.2}%` }} />
          <div className="grid-pattern" />
          <div className="page-floating-shapes">
            <div className="page-shape page-shape-1" />
            <div className="page-shape page-shape-2" />
            <div className="page-shape page-shape-3" />
            <div className="page-shape page-shape-4" />
            <div className="page-shape page-shape-5" />
            <div className="page-shape page-shape-6" />
          </div>
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
          <div className="decorative-lines">
            <div className="decorative-line line-1" style={{ '--rotation': '45deg' }} />
            <div className="decorative-line line-2" style={{ '--rotation': '-30deg' }} />
            <div className="decorative-line line-3" style={{ '--rotation': '60deg' }} />
          </div>
        </div>

        {/* Main Content */}
        <div className="landing-content">
          <div className="landing-left">
            <div className="landing-header">
              <div className="logo-badge"><HiSparkles className="sparkle-icon" /><span>DermAid</span></div>
              <h1 className="landing-title">
                Your Skin Health
                <br />
                <span className="gradient-text">
                  <ReactTyped strings={['Companion', 'Guardian', 'Expert', 'Partner']} typeSpeed={80} backSpeed={50} loop />
                </span>
              </h1>
              <p className="landing-subtitle">Advanced AI-powered dermatology solutions at your fingertips.<br />Analyze ingredients, detect concerns, and get expert guidance.</p>
            </div>

            <div className="feature-grid">
              <div className="feature-item"><div className="feature-icon"><FaStethoscope /></div><span>AI Analysis</span></div>
              <div className="feature-item"><div className="feature-icon"><FaShieldAlt /></div><span>Safe Ingredients</span></div>
              <div className="feature-item"><div className="feature-icon"><FaBrain /></div><span>Smart Detection</span></div>
              <div className="feature-item"><div className="feature-icon"><FaUserMd /></div><span>Expert Care</span></div>
            </div>

            <div className="cta-buttons">
              <Link to="/ingredient-analyser" className="cta-button primary"><FaSearch /><span>Get Started</span></Link>
              <Link to="/skin-care-generator" className="cta-button secondary"><span>Generate Your Own Skincare Routine</span></Link>
            </div>
          </div>

          <div className="landing-right">
            <div className="model-container">
              <div className="rotating-facts">
                <div className="facts-label">Did you know?</div>
                <div className="facts-text">
                  <ReactTyped
                    strings={[
                      'Your skin is the largest organ in your body, covering about 20 square feet!',
                      'UV protection is crucial - up to 90% of visible skin aging is caused by sun exposure.',
                      'Drinking water helps maintain skin elasticity and hydration from within.',
                      'Regular skin checks can detect early signs of skin cancer, improving treatment success rates.'
                    ]}
                    typeSpeed={50}
                    backSpeed={30}
                    loop
                    showCursor={true}
                    cursorChar="|"
                  />
                </div>
              </div>
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
              <div className="skin-label"><span className="skin-label-text">✨ This is your skin! ✨</span></div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator"><div className="scroll-arrow" /><span>Scroll to explore</span></div>
      </div>

      {/* After Landing: Why Skin Health Matters */}
      <section className="why-skin">
        <div className="section-lines"></div>
        <h2 className="section-title">Why Skin Health Matters</h2>
        <p className="section-subtitle">Your skin is your body’s first barrier — nurture it for confidence, comfort, and long-term wellness.</p>
        <div className="banner-grid">
          <div className="banner-card"><div className="banner-icon"><FaSun /></div><h3>Protect & Prevent</h3><p>Daily SPF shields from UV rays, helping reduce risk of sun damage, dark spots, and premature aging.</p></div>
          <div className="banner-card"><div className="banner-icon"><FaHandHoldingHeart /></div><h3>Care for Confidence</h3><p>Healthy skin boosts self-esteem and wellbeing. Small daily habits make a big difference.</p></div>
          <div className="banner-card"><div className="banner-icon"><FaLeaf /></div><h3>Healthy Barrier</h3><p>Support your skin’s natural barrier to retain moisture, reduce irritation, and feel your best.</p></div>
        </div>
      </section>

      {/* Visual Comparisons */}
      <section className="comparisons">
        <div className="section-lines"></div>
        <h2 className="section-title">See the Difference</h2>
        <p className="section-subtitle">Explore common skin concerns and how they can change the look of your skin.</p>
        <div className="sliders">
          {sliders.map(({ id, title, normal, condition }) => (
            <SkinSlider key={id} title={title} normal={normal} condition={condition} />
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-inner">

          <p style={{ marginTop: '0.5rem' }}>Stay informed, stay glowing. Explore ingredients, learn what your skin needs, and make confident choices with DermAid.</p>
          <div className="footer-cta" style={{ marginTop: '1rem' }}>
            <Link to="/find-dermatologist" className="cta-button primary">Discover More</Link>
          </div>
          <div className="footer-credits">A React Project by Sameer, Anish, and Aayush</div>
        </div>
      </footer>
    </>
  );
}

function SkinSlider({ title, normal, condition }) {
  const [value, setValue] = useState(0);
  return (
    <div className="skin-slider">
      <h3 className="slider-title">{title}</h3>
      <div className="slider-frame">
        <div className="slider-overlay">
          <div style={{ width: `${value}%` }}>
            <img src={condition} alt="Condition" className="slider-image" />
          </div>
          <div style={{ width: `${100 - value}%` }}>
            <img src={normal} alt="Normal skin" className="slider-image" />
          </div>
        </div>
        <input type="range" min="0" max="100" value={value} onChange={(e) => setValue(parseInt(e.target.value, 10))} className="slider-input" />
      </div>
    </div>
  );
}

export default HomePage;
