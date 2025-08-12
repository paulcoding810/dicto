import React from 'react'

export default function DictoPopup({
  trans,
  orig,
  dict,
  translit,
  examples,
  definition,
  synonyms,
  src = 'en-US',
  maxWidth = '20rem',
  showOrig = false,
}) {
  const expandable = Boolean(definition || synonyms?.length > 0 || examples?.length > 0)
  const [expanded, setExpanded] = React.useState(false)

  const tts = () => {
    if (!orig || !speechSynthesis) return
    const utterance = new SpeechSynthesisUtterance(orig)
    utterance.lang = src
    speechSynthesis.speak(utterance)
  }

  const tts2 = () => {
    chrome.runtime.sendMessage(
      {
        type: 'tts',
        text: orig,
        src: src,
      },
      (response) => {
        if (response && response.success) {
          console.log('TTS request sent successfully:', response.result)
          const audio = new Audio(response.result)
          audio.play().catch((error) => {
            console.error('Error playing audio:', error)
          })
        } else {
          console.error('Failed to send TTS request:', response)
        }
      },
    )
  }

  return (
    <div
      style={{
        maxWidth: maxWidth,
        padding: '0.5rem',
        overflow: 'auto',
        fontFamily: 'sans-serif',
        fontSize: '0.875rem',
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '0.375rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      {showOrig && orig && (
        <h3 style={{ marginBottom: '0.5rem', color: '#4b5563', fontWeight: 'bold' }}>{orig}</h3>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        {translit && <div style={{ color: '#6b7280' }}>[{translit}]</div>}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={tts}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#3b82f6',
              fontSize: '1.25rem',
            }}
            title="Browser Text-to-Speech"
          >
            🔉
          </button>
          <button
            onClick={tts2}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#3b82f6',
              fontSize: '1.25rem',
            }}
            title="Google Text-to-Speech"
          >
            🔊
          </button>
        </div>
      </div>
      <p style={{ fontStyle: 'italic', color: '#4b5563' }}>{trans}</p>

      {dict && dict.length > 0 && (
        <div style={{ marginBottom: '0.5rem' }}>
          {dict.map((entry, index) => (
            <div key={index} style={{ marginBottom: '0.25rem', borderBottom: '1px solid #e5e7eb' }}>
              {entry.pos && <span style={{ color: '#4b5563' }}>({entry.pos})</span>}
              {entry.terms && entry.terms.length > 0 && (
                <div style={{ color: '#6b7280' }}>{entry.terms.join(', ')}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {!expanded && expandable ? (
        <button
          style={{
            color: '#3b82f6',
            textDecoration: 'underline',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setExpanded(true)
          }}
        >
          Show More
        </button>
      ) : (
        <>
          {definition && (
            <div style={{ marginTop: '0.5rem' }}>
              <h3 style={{ fontWeight: '600' }}>Definition:</h3>
              <p>{definition}</p>
            </div>
          )}
          {synonyms && synonyms.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <h3 style={{ fontWeight: '600' }}>Synonyms:</h3>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1rem' }}>
                {synonyms.map((synonym, index) => (
                  <li key={index}>{synonym}</li>
                ))}
              </ul>
            </div>
          )}
          {examples && examples.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <h3 style={{ fontWeight: '600' }}>Examples:</h3>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1rem' }}>
                {examples.map((ex, index) => (
                  <li key={index} dangerouslySetInnerHTML={{ __html: ex }}></li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
