import { useState, useEffect } from 'react';

export default function MelanomaAnalyser() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [error, setError] = useState('');
  const [model, setModel] = useState(null);

  // Add CSS animation
  useEffect(() => {
    const styleSheet = document.styleSheets[0];
    if (styleSheet && !Array.from(styleSheet.cssRules).some(rule => rule.name === 'fadeIn')) {
      styleSheet.insertRule(`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
      `, styleSheet.cssRules.length);
    }
  }, []);

  // Load TensorFlow.js model
  useEffect(() => {
    async function loadModel() {
      try {
        const tf = await import('@tensorflow/tfjs');
        const loadedModel = await tf.loadLayersModel('/melanoma_model_tfjs/model.json');
        setModel(loadedModel);
        setModelLoading(false);
        console.log('Model loaded successfully');
      } catch (err) {
        console.error('Error loading model:', err);
        setError('Failed to load AI model. Please ensure model files are in public/melanoma_model_tfjs/');
        setModelLoading(false);
      }
    }
    loadModel();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setError('');
      setPrediction(null);
      setConfidence(null);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      return setError('Please upload an image first');
    }
    if (!model) {
      return setError('Model not loaded yet. Please wait...');
    }

    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const tf = await import('@tensorflow/tfjs');
      const img = new Image();
      img.src = preview;
      await new Promise((resolve) => { img.onload = resolve; });
      let tensor = tf.browser.fromPixels(img);
      tensor = tf.image.resizeBilinear(tensor, [128, 128]);
      tensor = tensor.div(255.0);
      tensor = tensor.expandDims(0);
      const predictions = await model.predict(tensor).data();
      const score = predictions[0];
      tensor.dispose();
      const isMelanoma = score < 0.5; // model outputs prob of class 1 (not melanoma)
      setPrediction(isMelanoma ? 'Melanoma' : 'Not Melanoma');
      setConfidence(((isMelanoma ? (1 - score) : score) * 100));
    } catch (err) {
      console.error('Prediction error:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const riskLevel = prediction ? (prediction === 'Melanoma' ? 'high' : 'low') : null;

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
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔬</div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '34px', fontWeight: '800' }}>Melanoma Detection AI</h1>
          <p style={{ margin: 0, fontSize: '15px', opacity: 0.95 }}>Upload a skin lesion image for AI‑powered screening</p>
          {modelLoading && (
            <div style={{ marginTop: '12px', padding: '10px 20px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '14px' }}>
              Loading AI model...
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '30px' }}>
          {/* Warning Banner */}
          <div style={{
            background: 'rgba(250, 204, 21, 0.12)',
            border: '1px solid rgba(250, 204, 21, 0.5)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'start',
            gap: '12px'
          }}>
            <div style={{ fontSize: '22px' }}>⚠️</div>
            <div style={{ fontSize: '14px', color: '#92400e', lineHeight: '1.6' }}>
              <strong>Medical Disclaimer:</strong> This tool is for educational purposes only and should NOT be used as a substitute for professional medical advice. Always consult a dermatologist for proper diagnosis and treatment.
            </div>
          </div>

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
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="lesionInput" />
            <label htmlFor="lesionInput" style={{ cursor: 'pointer', display: 'inline-block' }}>
              <div style={{ fontSize: '42px', marginBottom: '12px' }}>📸</div>
              <div style={{ fontSize: '17px', fontWeight: '700', color: '#0F766E', marginBottom: '6px' }}>Click to upload skin lesion image</div>
              <div style={{ fontSize: '14px', color: '#0f172a' }}>PNG, JPG up to 10MB</div>
            </label>
          </div>

          {/* Image Preview */}
          {preview && (
            <div style={{ marginBottom: '24px', textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={preview}
                  alt="Lesion preview"
                  style={{ maxWidth: '100%', maxHeight: '380px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                {prediction && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: riskLevel === 'low' ? '#10b981' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    boxShadow: '0 6px 22px rgba(0,0,0,0.2)',
                    animation: 'fadeIn 0.5s ease-in'
                  }}>
                    {riskLevel === 'low' ? '✓' : '⚠'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={analyzeImage}
            disabled={loading || !image || !model}
            style={{
              width: '100%',
              padding: '16px',
              background: (loading || !image || !model)
                ? '#94a3b8'
                : 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: (loading || !image || !model) ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: (loading || !image || !model)
                ? 'none'
                : '0 6px 18px rgba(20, 184, 166, 0.35)',
              marginBottom: '18px'
            }}
            onMouseEnter={(e) => {
              if (!loading && image && model) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 24px rgba(20, 184, 166, 0.45)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = (loading || !image || !model)
                ? 'nothing'
                : '0 6px 18px rgba(20, 184, 166, 0.35)';
            }}
          >
            {loading ? 'Analyzing…' : !model ? 'Loading Model…' : 'Analyze Image'}
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
          {prediction && (
            <div style={{
              background: riskLevel === 'high' ? 'rgba(254, 242, 242, 0.9)' : 'rgba(240, 253, 244, 0.9)',
              border: `1px solid ${riskLevel === 'high' ? '#fecaca' : '#bbf7d0'}`,
              borderRadius: '15px',
              padding: '24px',
              marginTop: '16px'
            }}>
              <h2 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '22px', fontWeight: '800' }}>Analysis Results</h2>
              <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', color: '#334155', marginBottom: '8px' }}>Prediction:</div>
                <div style={{ fontSize: '26px', fontWeight: '800', color: riskLevel === 'high' ? '#dc2626' : '#16a34a', marginBottom: '10px' }}>{prediction}</div>
                <div style={{ fontSize: '14px', color: '#334155' }}>Confidence: <strong>{confidence?.toFixed(1)}%</strong></div>
              </div>
              <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#334155' }}>
                <p style={{ margin: '0 0 12px 0' }}><strong>What this means:</strong></p>
                {riskLevel === 'high' ? (
                  <>
                    <p style={{ margin: '0 0 12px 0' }}>The AI has detected features consistent with melanoma. This requires immediate medical attention.</p>
                    <p style={{ margin: '0 0 12px 0' }}><strong>Next steps:</strong></p>
                    <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
                      <li>Schedule an appointment with a dermatologist immediately</li>
                      <li>Do not wait - early detection is crucial</li>
                      <li>Bring this analysis to your doctor</li>
                      <li>Monitor the lesion for any changes</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <p style={{ margin: '0 0 12px 0' }}>The AI did not detect features consistent with melanoma. However, this is not a definitive diagnosis.</p>
                    <p style={{ margin: '0 0 12px 0' }}><strong>Recommendations:</strong></p>
                    <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
                      <li>Continue regular skin self‑examinations</li>
                      <li>See a dermatologist if the lesion changes</li>
                      <li>Schedule routine professional skin checks</li>
                      <li>Use sun protection to prevent skin damage</li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}