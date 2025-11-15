import { useState } from 'react';

export default function DermatologyAnalyzer() {
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px',
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{
            margin: '0 0 10px 0',
            fontSize: '36px',
            fontWeight: '700'
          }}>
            Dermatology Product Analyzer
          </h1>
          <p style={{
            margin: 0,
            fontSize: '16px',
            opacity: 0.9
          }}>
            Upload a product image to analyze ingredients and potential risks
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '40px' }}>
          {/* Upload Section */}
          <div style={{
            border: '3px dashed #d0d0d0',
            borderRadius: '15px',
            padding: '40px',
            textAlign: 'center',
            marginBottom: '30px',
            background: '#fafafa',
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
                fontSize: '48px',
                marginBottom: '15px'
              }}>📸</div>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#667eea',
                marginBottom: '8px'
              }}>
                Click to upload product image
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666'
              }}>
                PNG, JPG up to 10MB
              </div>
            </label>
          </div>

          {/* Image Preview */}
          {preview && (
            <div style={{
              marginBottom: '30px',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={preview}
                  alt="Product preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    borderRadius: '15px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                {/* Safety indicator overlay */}
                {safetyStatus && (
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: safetyStatus === 'safe' 
                      ? '#10b981' 
                      : safetyStatus === 'caution' 
                      ? '#f59e0b' 
                      : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
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
                ? '#ccc' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading || !image ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: loading || !image 
                ? 'none' 
                : '0 4px 15px rgba(102, 126, 234, 0.4)',
              marginBottom: '20px'
            }}
            onMouseEnter={(e) => {
              if (!loading && image) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = loading || !image 
                ? 'none' 
                : '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            {loading ? 'Analyzing...' : 'Analyze Product'}
          </button>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '16px',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '10px',
              color: '#c33',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div style={{
              background: '#f8f9fa',
              border: '1px solid #e0e0e0',
              borderRadius: '15px',
              padding: '30px',
              marginTop: '20px'
            }}>
              <h2 style={{
                margin: '0 0 20px 0',
                color: '#333',
                fontSize: '24px',
                fontWeight: '700'
              }}>
                Analysis Results
              </h2>
              <div style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#444'
              }}>
                {analysis.split('\n').map((line, i) => {
                  // Bold text between ** markers
                  const parts = line.split(/(\*\*.*?\*\*)/g);
                  return (
                    <p key={i} style={{ margin: '0 0 12px 0' }}>
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
        maxWidth: '900px',
        margin: '20px auto 0',
        textAlign: 'center',
        color: 'white',
        fontSize: '13px',
        opacity: 0.8
      }}>
      </div>
    </div>
  );
}