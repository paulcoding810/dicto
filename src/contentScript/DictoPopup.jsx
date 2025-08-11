import React from 'react'

export default function DictoPopup({
  trans,
  orig,
  dict,
  translit,
  examples,
  definition,
  synonyms,
}) {
  const expandable = Boolean(definition || synonyms?.length > 0 || examples?.length > 0)
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div
      id="dicto-popup"
      style={{
        maxWidth: '20rem',
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
      <h2 style={{ marginBottom: '0.5rem', fontSize: '1.125rem', fontWeight: 'bold' }}>{orig}</h2>
      <p style={{ fontStyle: 'italic', color: '#4b5563' }}>{trans}</p>
      {translit && <p style={{ color: '#6b7280' }}>[{translit}]</p>}

      {dict && dict.length > 0 && (
        <div style={{ marginBottom: '0.5rem' }}>
          {dict.map((entry, index) => (
            <div key={index} style={{ marginBottom: '0.25rem', borderBottom: '1px solid #e5e7eb' }}>
              {entry.pos && (
                <span style={{ marginLeft: '0.25rem', color: '#4b5563' }}>({entry.pos})</span>
              )}
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
