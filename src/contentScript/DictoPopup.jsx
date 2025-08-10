import React from 'react'
import '../index.css'

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
      className="max-w-xs p-2 overflow-auto font-sans text-sm bg-white border border-gray-300 rounded-md shadow-md"
    >
      <h2 className="mb-2 text-lg font-bold">{orig}</h2>
      <p className="italic text-gray-700">{trans}</p>
      {translit && <p className="text-gray-500">[{translit}]</p>}

      {dict && dict.length > 0 && (
        <div className="mb-2">
          {dict.map((entry, index) => (
            <div key={index} className="mb-1 border-b-1">
              {entry.pos && <span className="ml-1 text-gray-600">({entry.pos})</span>}
              {entry.terms && entry.terms.length > 0 && (
                <div className="text-gray-500">{entry.terms.join(', ')}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {!expanded && expandable ? (
        <button
          className="text-blue-500 hover:underline"
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
            <div className="mt-2">
              <h3 className="font-semibold">Definition:</h3>
              <p>{definition}</p>
            </div>
          )}
          {synonyms && synonyms.length > 0 && (
            <div className="mt-2">
              <h3 className="font-semibold">Synonyms:</h3>
              <ul className="list-disc list-inside">
                {synonyms.map((synonym, index) => (
                  <li key={index}>{synonym}</li>
                ))}
              </ul>
            </div>
          )}
          {examples && examples.length > 0 && (
            <div className="mt-2">
              <h3 className="font-semibold">Examples:</h3>
              <ul className="list-disc list-inside">
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
