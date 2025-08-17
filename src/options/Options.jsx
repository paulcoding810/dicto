import { useEffect, useState } from 'react'
import DictoPopup from '../contentScript/DictoPopup'
import '../index.css'
import SwipeableItem from './SwipeableItem'

export const Options = () => {
  const [history, setHistory] = useState([])

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        chrome.storage.local.get(['history'], (result) => {
          // get first 50 records
          setHistory(result.history ? result.history.slice(0, 50) : [])
        })
      }
    }
    handleVisibilityChange()

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const handleDeleteItem = (itemToDelete) => {
    const updatedHistory = history.filter((item) => item.timestamp !== itemToDelete.timestamp)
    setHistory(updatedHistory)

    // Update storage
    chrome.storage.local.set({ history: updatedHistory }, () => {
      console.log('History item deleted')
    })
  }

  return (
    <main>
      <div className="flex flex-col gap-2 p-4">
        {history.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {history.map((item, index) => (
              <SwipeableItem key={item.timestamp} item={item} onDelete={handleDeleteItem}>
                <DictoPopup {...item.translation} showOrig maxWidth="none" />
              </SwipeableItem>
            ))}
          </div>
        ) : (
          <p>No translation history available.</p>
        )}
      </div>
    </main>
  )
}

export default Options
