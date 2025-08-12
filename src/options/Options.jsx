import { useEffect, useState } from 'react'
import DictoPopup from '../contentScript/DictoPopup'
import '../index.css'

export const Options = () => {
  const [history, setHistory] = useState([])

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        chrome.storage.local.get(['history'], (result) => {
          setHistory(result.history || [])
        })
      }
    }
    handleVisibilityChange()

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <main>
      <div className="flex flex-col gap-2 p-4">
        {history.length > 0 ? (
          <>
            {history.map((item, index) => (
              <DictoPopup {...item.translation} showOrig maxWidth="none" key={item.timestamp} />
            ))}
          </>
        ) : (
          <p>No translation history available.</p>
        )}
      </div>
    </main>
  )
}

export default Options
