import React from 'react'

export default function DictoPopup({
  trans,
  orig,
  dict,
  translit,
  examples,
  definitions,
  src = 'en-US',
  maxWidth = '22rem',
  showOrig = false,
}) {
  const expandable = Boolean(definitions?.length > 0 || examples?.length > 0)
  const [expanded, setExpanded] = React.useState(false)

  const tts = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (!orig || !speechSynthesis) return
    const utterance = new SpeechSynthesisUtterance(orig)
    utterance.lang = src
    speechSynthesis.speak(utterance)
  }

  const tts2 = (e) => {
    e.stopPropagation()
    e.preventDefault()
    chrome.runtime.sendMessage(
      {
        type: 'tts',
        text: orig,
        src: src,
      },
      (response) => {
        if (response && response.success) {
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
        maxWidth,
        minWidth: '16rem',
        padding: '1rem',
        overflow: 'auto',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        fontSize: '0.875rem',
        background: 'linear-gradient(135deg, #f9fafb 60%, #e0f2fe 100%)',
        border: '1px solid #cbd5e1',
        borderRadius: '0.375rem',
        boxShadow: '0 6px 22px 0 rgba(34,99,196,0.08), 0 1.5px 8px 0 rgba(0,0,0,0.04)',
        color: '#334155',
      }}
    >
      {showOrig && orig && (
        <h3
          style={{
            marginBottom: '0.5rem',
            color: '#0f172a',
            fontWeight: 700,
            fontSize: '1.16rem',
            letterSpacing: '0.02em',
            lineHeight: 1.3,
          }}
        >
          {orig}
        </h3>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingBottom: '0.7rem',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '0.7rem',
          gap: '0.7rem',
        }}
      >
        {translit && (
          <div style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.99rem' }}>
            [{translit}]
          </div>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={tts}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#60a5fa',
              fontSize: '1.25rem',
              padding: 0,
              marginRight: '2px',
              transition: 'color .14s',
            }}
            title="Browser Text-to-Speech"
            onMouseOver={(e) => (e.currentTarget.style.color = '#2563eb')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#60a5fa')}
          >
            🔉
          </button>
          <button
            onClick={tts2}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#38bdf8',
              fontSize: '1.3rem',
              padding: 0,
              transition: 'color .14s',
            }}
            title="Google Text-to-Speech"
            onMouseOver={(e) => (e.currentTarget.style.color = '#0284c7')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#38bdf8')}
          >
            🔊
          </button>
        </div>
      </div>
      <p
        style={{
          fontStyle: 'italic',
          color: '#475569',
          background: '#f1f5f9',
          borderRadius: '0.45em',
          padding: '0.23em 0.9em',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        {trans}
      </p>

      {dict && dict.length > 0 && (
        <div style={{ marginTop: '0.7rem', marginBottom: '0.5rem' }}>
          {dict.map((entry, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'baseline',
                gap: '0.55em',
                marginBottom: '0.18rem',
                padding: '0.11rem 0',
                borderBottom: '1px dotted #cbd5e1',
              }}
            >
              {entry.pos && (
                <span style={{ color: '#8b5cf6', fontWeight: 500, fontSize: '0.97em' }}>
                  {entry.pos}
                </span>
              )}
              {entry.terms && entry.terms.length > 0 && (
                <div style={{ color: '#64748b', fontSize: '0.98em' }}>{entry.terms.join(', ')}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {!expanded && expandable ? (
        <button
          style={{
            color: '#0ea5e9',
            textDecoration: 'underline',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '.5em',
            fontWeight: 500,
            margin: '0.7em 0',
            padding: '0.23em 1em',
            cursor: 'pointer',
            transition: 'background .16s',
          }}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setExpanded(true)
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#bae6fd')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#f0f9ff')}
        >
          Show More
        </button>
      ) : (
        <>
          {definitions && definitions.length > 0 && (
            <div style={{ marginTop: '0.9rem' }}>
              <h4
                style={{ fontWeight: 600, color: '#7c3aed', marginBottom: 6, fontSize: '1.03em' }}
              >
                Definitions
              </h4>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.2rem', marginBottom: '0.2rem' }}>
                {definitions.map((def, index) => (
                  <li key={index} style={{ marginBottom: '0.32em' }}>
                    <strong>{def.gloss}</strong>
                    {def.example && (
                      <div
                        style={{
                          fontStyle: 'italic',
                          color: '#0ea5e9',
                          background: '#f0faff',
                          borderRadius: '0.3em',
                          padding: '2px 0.6em',
                          marginTop: '1.5px',
                        }}
                      >
                        👉🏻 {def.example}
                      </div>
                    )}
                    {def.synonyms && def.synonyms.length > 0 && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#7c3aed',
                          marginTop: '2px',
                        }}
                      >
                        🎹 {def.synonyms.join(', ')}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {examples && examples.length > 0 && (
            <div style={{ marginTop: '1.1rem' }}>
              <h4
                style={{ fontWeight: 600, color: '#0891b2', marginBottom: 6, fontSize: '1.02em' }}
              >
                Examples
              </h4>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.2rem' }}>
                {examples.map((ex, index) => (
                  <li
                    key={index}
                    style={{ marginBottom: '0.28em' }}
                    dangerouslySetInnerHTML={{ __html: ex }}
                  ></li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
