import { useEffect, useState } from 'react'
import DictoPopup from '../contentScript/DictoPopup'
import '../index.css'
import FlashCard from './FlashCard'
import SwipeableItem from './SwipeableItem'
import DownloadIcon from '../assets/download.svg?react'
import '../contentScript'

export const Options = () => {
  const [history, setHistory] = useState([])

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        chrome.storage.local.get(['history'], (result) => {
          // get first 60 records
          setHistory(result.history ? result.history.slice(0, 3 * 20) : [])
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
      <div className="flex items-center justify-between p-4 text-white bg-blue-500">
        <h1 className="text-xl font-bold">Translation History</h1>
        <button
          className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
          onClick={() => {
            const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `translation_history_${new Date().toDateString().replaceAll(' ', '_')}.json`
            a.click()
            a.remove()
          }}
        >
          <DownloadIcon title="Download" className="w-5 h-5" />
        </button>
      </div>
      <div className="flex flex-col gap-2 p-4">
        {history.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {history.map((item, index) => (
              <SwipeableItem key={item.timestamp} item={item} onDelete={handleDeleteItem}>
                <FlashCard title={item.text}>
                  <DictoPopup {...item.translation} showOrig expanded maxWidth="none" />
                </FlashCard>
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
