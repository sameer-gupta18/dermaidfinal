import { useState } from 'react';

export default function RoutineGenerator() {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    skinType: '',
    concerns: [],
    sensitivity: '',
    climate: '',
    budget: '',
    routine: ''
  });
  
  const [routine, setRoutine] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1 = form, 2 = results
  
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConcernToggle = (concern) => {
    setFormData(prev => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter(c => c !== concern)
        : [...prev.concerns, concern]
    }));
  };

  const generateRoutine = async () => {
    if (!formData.age || !formData.gender || !formData.skinType) {
      setError('Please fill in all required fields (Age, Gender, Skin Type)');
      return;
    }

    if (!API_KEY || API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
      setError('API key not configured. Please add your OpenAI API key.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const prompt = `Create a personalized skincare routine for:
- Age: ${formData.age}
- Gender: ${formData.gender}
- Skin Type: ${formData.skinType}
- Main Concerns: ${formData.concerns.join(', ') || 'None specified'}
- Sensitivity: ${formData.sensitivity || 'Normal'}
- Climate: ${formData.climate || 'Moderate'}
- Budget: ${formData.budget || 'Medium'}
- Current Routine: ${formData.routine || 'None'}

Provide a detailed skincare routine with:
1. MORNING ROUTINE (list 4-6 steps with specific product types and why)
2. EVENING ROUTINE (list 4-6 steps with specific product types and why)
3. WEEKLY TREATMENTS (2-3 treatments)
4. KEY INGREDIENTS to look for
5. INGREDIENTS TO AVOID
6. ADDITIONAL TIPS (3-4 tips)

Format with clear headers using **bold** for section titles. Keep it under 500 words, practical and actionable.`;

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
              role: 'system',
              content: 'You are an expert dermatologist and skincare specialist. Provide evidence-based, personalized skincare advice.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to generate routine');
      }

      const generatedRoutine = data.choices[0].message.content;
      setRoutine(generatedRoutine);
      setStep(2);
    } catch (err) {
      setError(err.message || 'An error occurred while generating your routine');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let y = margin;

      // Parse text with formatting markers
      const parseFormattedText = (text) => {
        const segments = [];
        let currentPos = 0;
        
        // Match **bold**, *italic*, and _underline_
        const regex = /(\*\*.*?\*\*|\*.*?\*|_.*?_)/g;
        let match;
        
        while ((match = regex.exec(text)) !== null) {
          // Add text before the match
          if (match.index > currentPos) {
            segments.push({
              text: text.substring(currentPos, match.index),
              bold: false,
              italic: false,
              underline: false
            });
          }
          
          // Add formatted text
          const matchedText = match[0];
          if (matchedText.startsWith('**')) {
            segments.push({
              text: matchedText.slice(2, -2),
              bold: true,
              italic: false,
              underline: false
            });
          } else if (matchedText.startsWith('*')) {
            segments.push({
              text: matchedText.slice(1, -1),
              bold: false,
              italic: true,
              underline: false
            });
          } else if (matchedText.startsWith('_')) {
            segments.push({
              text: matchedText.slice(1, -1),
              bold: false,
              italic: false,
              underline: true
            });
          }
          
          currentPos = regex.lastIndex;
        }
        
        // Add remaining text
        if (currentPos < text.length) {
          segments.push({
            text: text.substring(currentPos),
            bold: false,
            italic: false,
            underline: false
          });
        }
        
        return segments.length > 0 ? segments : [{ text, bold: false, italic: false, underline: false }];
      };

      // Add formatted text with proper line wrapping
      const addFormattedText = (text, fontSize, defaultColor = [40, 40, 40], isHeader = false) => {
        doc.setFontSize(fontSize);
        
        const segments = parseFormattedText(text);
        const lineHeight = fontSize * 0.4;
        let currentX = margin;
        let currentLine = [];
        let currentLineWidth = 0;
        
        segments.forEach(segment => {
          const words = segment.text.split(' ');
          
          words.forEach((word, idx) => {
            if (idx > 0 || currentLine.length > 0) word = ' ' + word;
            
            // Set font style for measurement
            const style = segment.bold && segment.italic ? 'bolditalic' :
                         segment.bold ? 'bold' :
                         segment.italic ? 'italic' : 'normal';
            doc.setFont('helvetica', style);
            
            const wordWidth = doc.getTextWidth(word);
            
            if (currentLineWidth + wordWidth > maxWidth && currentLine.length > 0) {
              // Print current line
              currentX = margin;
              currentLine.forEach(item => {
                doc.setFont('helvetica', item.style);
                doc.setTextColor(item.color[0], item.color[1], item.color[2]);
                
                if (item.underline) {
                  const textWidth = doc.getTextWidth(item.text);
                  doc.text(item.text, currentX, y);
                  doc.line(currentX, y + 0.5, currentX + textWidth, y + 0.5);
                } else {
                  doc.text(item.text, currentX, y);
                }
                
                currentX += doc.getTextWidth(item.text);
              });
              
              y += lineHeight + fontSize * 0.15;
              
              // Check for new page
              if (y > pageHeight - 30) {
                doc.addPage();
                y = margin;
              }
              
              currentLine = [];
              currentLineWidth = 0;
              currentX = margin;
            }
            
            currentLine.push({
              text: word,
              style: style,
              underline: segment.underline,
              color: isHeader ? [102, 126, 234] : defaultColor
            });
            currentLineWidth += wordWidth;
          });
        });
        
        // Print remaining line
        if (currentLine.length > 0) {
          currentX = margin;
          currentLine.forEach(item => {
            doc.setFont('helvetica', item.style);
            doc.setTextColor(item.color[0], item.color[1], item.color[2]);
            
            if (item.underline) {
              const textWidth = doc.getTextWidth(item.text);
              doc.text(item.text, currentX, y);
              doc.line(currentX, y + 0.5, currentX + textWidth, y + 0.5);
            } else {
              doc.text(item.text, currentX, y);
            }
            
            currentX += doc.getTextWidth(item.text);
          });
          
          y += lineHeight + fontSize * 0.15;
        }
      };

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(102, 126, 234);
      doc.text('Your Personalized Skincare Routine', margin, y);
      y += 12;

      // User Info
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      const userInfo = `Age: ${formData.age} | Gender: ${formData.gender} | Skin Type: ${formData.skinType}`;
      doc.text(userInfo, margin, y);
      y += 5;
      
      if (formData.concerns.length > 0) {
        doc.text(`Concerns: ${formData.concerns.join(', ')}`, margin, y);
        y += 5;
      }

      // Line separator
      y += 3;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Parse and format routine content
      const lines = routine.split('\n');
      
      for (let line of lines) {
        line = line.trim();
        
        if (!line) {
          y += 3;
          continue;
        }

        // Check if line is a major section header (starts with number)
        if (line.match(/^\d+\.\s*\*\*/)) {
          y += 4;
          addFormattedText(line, 14, [40, 40, 40], true);
          y += 2;
        } 
        // Check if line contains bold text (subsection or emphasis)
        else if (line.includes('**') || line.includes('*') || line.includes('_')) {
          addFormattedText(line, 10, [40, 40, 40], false);
        } 
        // Regular text
        else {
          addFormattedText(line, 10, [60, 60, 60], false);
        }
        
        // Check for new page
        if (y > pageHeight - 30) {
          doc.addPage();
          y = margin;
        }
      }

      // Footer
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      const footerText = 'Generated by Skincare Routine Generator | For educational purposes only';
      const footerWidth = doc.getTextWidth(footerText);
      doc.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 10);

      doc.save('skincare-routine.pdf');
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  const resetForm = () => {
    setStep(1);
    setRoutine('');
    setError('');
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
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🧴</div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '34px', fontWeight: '800' }}>
            Personalized Skincare Routine
          </h1>
          <p style={{ margin: 0, fontSize: '15px', opacity: 0.95 }}>
            Tell us about your skin and goals – we’ll craft a routine just for you.
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '30px' }}>
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

          {/* Multi-step form / results */}
          {step === 1 ? (
            <>
              {/* Form Fields */}
              {/* (Form layout and controls preserved from existing implementation) */}
              {/* ... full existing form content remains unchanged ... */}
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '20px'
                }}>
                  Tell us about yourself
                </h2>

                {/* Age */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#555',
                    marginBottom: '8px'
                  }}>
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="e.g., 25"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Gender */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#555',
                    marginBottom: '8px'
                  }}>
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* Skin Type */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#555',
                    marginBottom: '8px'
                  }}>
                    Skin Type *
                  </label>
                  <select
                    name="skinType"
                    value={formData.skinType}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="Dry">Dry</option>
                    <option value="Oily">Oily</option>
                    <option value="Combination">Combination</option>
                    <option value="Normal">Normal</option>
                    <option value="Sensitive">Sensitive</option>
                  </select>
                </div>

                {/* Main Concerns */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#555',
                    marginBottom: '8px'
                  }}>
                    Main Skin Concerns (select all that apply)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {['Acne', 'Aging', 'Dark Spots', 'Redness', 'Large Pores', 'Dullness', 'Fine Lines'].map(concern => (
                      <button
                        key={concern}
                        type="button"
                        onClick={() => handleConcernToggle(concern)}
                        style={{
                          padding: '8px 16px',
                          border: formData.concerns.includes(concern) 
                            ? '2px solid #14b8a6' 
                            : '2px solid #e0e0e0',
                          background: formData.concerns.includes(concern) 
                            ? '#e0f2f7' 
                            : 'white',
                          color: formData.concerns.includes(concern) 
                            ? '#14b8a6' 
                            : '#666',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {concern}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sensitivity */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#555',
                    marginBottom: '8px'
                  }}>
                    Skin Sensitivity
                  </label>
                  <select
                    name="sensitivity"
                    value={formData.sensitivity}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="Very Sensitive">Very Sensitive</option>
                    <option value="Somewhat Sensitive">Somewhat Sensitive</option>
                    <option value="Not Sensitive">Not Sensitive</option>
                  </select>
                </div>

                {/* Climate */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#555',
                    marginBottom: '8px'
                  }}>
                    Climate
                  </label>
                  <select
                    name="climate"
                    value={formData.climate}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="Hot & Humid">Hot & Humid</option>
                    <option value="Hot & Dry">Hot & Dry</option>
                    <option value="Cold & Dry">Cold & Dry</option>
                    <option value="Temperate">Temperate</option>
                  </select>
                </div>

                {/* Budget */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#555',
                    marginBottom: '8px'
                  }}>
                    Budget Preference
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="Budget-friendly">Budget-friendly</option>
                    <option value="Mid-range">Mid-range</option>
                    <option value="High-end">High-end</option>
                    <option value="Mix">Mix of all</option>
                  </select>
                </div>

                {/* Current Routine */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#555',
                    marginBottom: '8px'
                  }}>
                    Current Routine (Optional)
                  </label>
                  <textarea
                    name="routine"
                    value={formData.routine}
                    onChange={handleInputChange}
                    placeholder="Describe your current skincare routine if any..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateRoutine}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: loading 
                    ? '#ccc' 
                    : 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: loading 
                    ? 'none' 
                    : '0 4px 15px rgba(16, 185, 129, 0.4)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = loading 
                    ? 'none' 
                    : '0 4px 15px rgba(16, 185, 129, 0.4)';
                }}
              >
                {loading ? 'Generating Your Routine...' : 'Generate Routine ✨'}
              </button>
            </>
          ) : (
            // Results
            <>
              {/* Routine Display */}
              <div style={{
                background: '#f8f9fa',
                border: '1px solid #e0e0e0',
                borderRadius: '15px',
                padding: '30px',
                marginBottom: '20px'
              }}>
                <h2 style={{
                  margin: '0 0 20px 0',
                  color: '#333',
                  fontSize: '24px',
                  fontWeight: '700'
                }}>
                  Your Personalized Routine
                </h2>
                <div style={{
                  fontSize: '15px',
                  lineHeight: '1.8',
                  color: '#444'
                }}>
                  {routine.split('\n').map((line, i) => {
                    if (!line.trim()) {
                      return <div key={i} style={{ height: '8px' }} />;
                    }

                    // Parse line for mixed formatting
                    const parseFormatting = (text) => {
                      const parts = [];
                      let currentPos = 0;
                      
                      // Match **bold**, *italic*, and _underline_
                      const regex = /(\*\*.*?\*\*|\*.*?\*|_.*?_)/g;
                      let match;
                      
                      while ((match = regex.exec(text)) !== null) {
                        // Add text before match
                        if (match.index > currentPos) {
                          parts.push({
                            text: text.substring(currentPos, match.index),
                            format: 'normal'
                          });
                        }
                        
                        // Add formatted text
                        const matchedText = match[0];
                        if (matchedText.startsWith('**')) {
                          parts.push({
                            text: matchedText.slice(2, -2),
                            format: 'bold'
                          });
                        } else if (matchedText.startsWith('*')) {
                          parts.push({
                            text: matchedText.slice(1, -1),
                            format: 'italic'
                          });
                        } else if (matchedText.startsWith('_')) {
                          parts.push({
                            text: matchedText.slice(1, -1),
                            format: 'underline'
                          });
                        }
                        
                        currentPos = regex.lastIndex;
                      }
                      
                      // Add remaining text
                      if (currentPos < text.length) {
                        parts.push({
                          text: text.substring(currentPos),
                          format: 'normal'
                        });
                      }
                      
                      return parts;
                    };

                    const parts = parseFormatting(line);
                    
                    // Check if it's a major section header (starts with number and has **)
                    const isMainHeader = line.match(/^\d+\.\s*\*\*/);
                    
                    return (
                      <p key={i} style={{ 
                        margin: '0 0 12px 0',
                        fontSize: isMainHeader ? '17px' : '15px',
                        fontWeight: isMainHeader ? '700' : 'normal',
                        color: isMainHeader ? '#14b8a6' : '#444',
                        marginTop: isMainHeader ? '16px' : '0'
                      }}>
                        {parts.map((part, j) => {
                          if (part.format === 'bold') {
                            return <strong key={j} style={{ fontWeight: '600', color: '#333' }}>{part.text}</strong>;
                          } else if (part.format === 'italic') {
                            return <em key={j} style={{ fontStyle: 'italic' }}>{part.text}</em>;
                          } else if (part.format === 'underline') {
                            return <span key={j} style={{ textDecoration: 'underline' }}>{part.text}</span>;
                          }
                          return <span key={j}>{part.text}</span>;
                        })}
                      </p>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '15px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={downloadPDF}
                  style={{
                    flex: '1',
                    minWidth: '200px',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  📥 Download as PDF
                </button>
                                
                <button
                  onClick={resetForm}
                  style={{
                    flex: '1',
                    minWidth: '200px',
                    padding: '16px',
                    background: 'white',
                    color: '#14b8a6',
                    border: '2px solid #14b8a6',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e0f2f7';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                  }}
                >
                  🔄 Create New Routine
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Note */}
      <div style={{
        maxWidth: '800px',
        margin: '20px auto 0',
        textAlign: 'center',
        color: '#0f172a',
        fontSize: '13px',
        opacity: 0.8
      }}>
        This routine is AI-generated for educational purposes. Consult a dermatologist for medical advice.
      </div>
    </div>
  );
}