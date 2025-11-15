import { useState } from 'react';

export default function IngredientAnalyser() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [safetyStatus, setSafetyStatus] = useState(null); // 'safe', 'caution', 'avoid'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Replace with your actual OpenAI API key
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY

  // Add CSS animation
  const styleSheet = document.styleSheets[0];
  if (styleSheet && !Array.from(styleSheet.cssRules).some(rule => rule.name === 'fadeIn')) {
    styleSheet.insertRule(`
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.5); }
        to { opacity: 1; transform: scale(1); }
      }
    `, styleSheet.cssRules.length);
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setError('');
      setAnalysis('');
      setSafetyStatus(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeProduct = async () => {
    if (!image) {
      setError('Please upload an image first');
      return;
    }
    
    if (!API_KEY || API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
      setError('API key not configured. Please add your OpenAI API key to the code.');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis('');

    try {
      const base64Image = preview.split(',')[1];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this skincare product image. Provide ONLY:
1. Safety: Safe/Caution/Avoid 
2: Explanation: Why is it safe. Any caveats?
3. Harmful chemicals: List any (or "None detected") (explain each)
4. Best for: Skin type(s) (one sentence of explanation)

Note, if it is mostly safe, keep 'Safe'. Keep response under 100 words total. Be direct and concise.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 600
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to analyze image');
      }

      const result = data.choices[0].message.content;
      setAnalysis(result);
      
      // Determine safety status from response
      const lowerResult = result.toLowerCase();
      if (lowerResult.includes('safe') && !lowerResult.includes('caution') && !lowerResult.includes('avoid')) {
        setSafetyStatus('safe');
      } else if (lowerResult.includes('caution')) {
        setSafetyStatus('caution');
      } else if (lowerResult.includes('avoid')) {
        setSafetyStatus('avoid');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing the image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #d1fae5 100%)',
      padding: '90px 20px 40px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        background: 'rgba(255,255,255,0.7)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: '0 20px 60px rgba(20,184,166,0.12)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
          padding: '36px',
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{
            margin: '0 0 10px 0',
            fontSize: '34px',
            fontWeight: '800'
          }}>
            Ingredient Analyser
          </h1>
          <p style={{
            margin: 0,
            fontSize: '15px',
            opacity: 0.95
          }}>
            Upload a product image to analyze ingredients and potential risks
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '30px' }}>
          {/* Upload Section */}
          <div style={{
            border: '2px dashed rgba(20,184,166,0.35)',
            borderRadius: '15px',
            padding: '32px',
            textAlign: 'center',
            marginBottom: '24px',
            background: 'rgba(255,255,255,0.7)',
            transition: 'all 0.3s'
          }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="fileInput"
            />
            <label htmlFor="fileInput" style={{
              cursor: 'pointer',
              display: 'inline-block'
            }}>
              <div style={{
                fontSize: '42px',
                marginBottom: '12px'
              }}>📸</div>
              <div style={{
                fontSize: '17px',
                fontWeight: '700',
                color: '#0f766e',
                marginBottom: '6px'
              }}>
                Click to upload product image
              </div>
              <div style={{
                fontSize: '14px',
                color: '#0f172a'
              }}>
                PNG, JPG up to 10MB
              </div>
            </label>
          </div>

          {/* Image Preview */}
          {preview && (
            <div style={{
              marginBottom: '24px',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={preview}
                  alt="Product preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '380px',
                    borderRadius: '15px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                />
                {/* Safety indicator overlay */}
                {safetyStatus && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: safetyStatus === 'safe' 
                      ? '#10b981' 
                      : safetyStatus === 'caution' 
                      ? '#f59e0b' 
                      : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    boxShadow: '0 6px 22px rgba(0,0,0,0.2)',
                    animation: 'fadeIn 0.5s ease-in'
                  }}>
                    {safetyStatus === 'safe' ? '✓' : safetyStatus === 'caution' ? '⚠' : '✗'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={analyzeProduct}
            disabled={loading || !image}
            style={{
              width: '100%',
              padding: '16px',
              background: loading || !image 
                ? '#94a3b8' 
                : 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: loading || !image ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: loading || !image 
                ? 'none' 
                : '0 6px 18px rgba(20, 184, 166, 0.35)',
              marginBottom: '18px'
            }}
            onMouseEnter={(e) => {
              if (!loading && image) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 24px rgba(20, 184, 166, 0.45)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = loading || !image 
                ? 'none' 
                : '0 6px 18px rgba(20, 184, 166, 0.35)';
            }}
          >
            {loading ? 'Analyzing...' : 'Analyze Product'}
          </button>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '14px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '10px',
              color: '#991b1b',
              marginBottom: '18px',
              fontSize: '14px'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div style={{
              background: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(226,232,240,0.9)',
              borderRadius: '15px',
              padding: '24px',
              marginTop: '16px'
            }}>
              <h2 style={{
                margin: '0 0 16px 0',
                color: '#0f172a',
                fontSize: '22px',
                fontWeight: '800'
              }}>
                Analysis Results
              </h2>
              <div style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#334155'
              }}>
                {analysis.split('\n').map((line, i) => {
                  // Bold text between ** markers
                  const parts = line.split(/(\*\*.*?\*\*)/g);
                  return (
                    <p key={i} style={{ margin: '0 0 10px 0' }}>
                      {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={j}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      })}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Note */}
      <div style={{
        maxWidth: '1000px',
        margin: '18px auto 0',
        textAlign: 'center',
        color: '#0f172a',
        fontSize: '13px',
        opacity: 0.8
      }}>
      </div>
    </div>
  );
}