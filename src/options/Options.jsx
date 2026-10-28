import { useEffect, useRef, useState } from 'react'
import SwapIcon from '../assets/arrow-right-left.svg?react'
import DownloadIcon from '../assets/download.svg?react'
import '../contentScript'
import DictoPopup from '../contentScript/DictoPopup'
import { tl } from '../data/languages'
import '../index.css'
import FlashCard from './FlashCard'
import Tutorial from './Tutorial'

export const Options = () => {
  const [history, setHistory] = useState([])
  const [targetLanguage, setTargetLanguage] = useState('vi')
  const [showInverted, setShowInverted] = useState(false)
  const [deleted, setDeleted] = useState(null)
  const undoTimer = useRef(null)

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        chrome.storage.local.get(['history', 'targetLanguage'], (result) => {
          setHistory(result.history ?? [])
          setTargetLanguage(result.targetLanguage || 'vi')
        })
      }
    }
    handleVisibilityChange()

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const saveHistory = (updatedHistory) => {
    setHistory(updatedHistory)
    chrome.storage.local.set({ history: updatedHistory })
  }

  const handleDeleteItem = (itemToDelete, index) => {
    saveHistory(history.filter((item) => item !== itemToDelete))
    setDeleted({ item: itemToDelete, index })
    clearTimeout(undoTimer.current)
    undoTimer.current = setTimeout(() => setDeleted(null), 5000)
  }

  const handleUndo = () => {
    clearTimeout(undoTimer.current)
    const restored = [...history]
    restored.splice(deleted.index, 0, deleted.item)
    saveHistory(restored)
    setDeleted(null)
  }

  return (
    <main>
      <Tutorial />
      <div className="flex items-center justify-between p-4 text-white bg-blue-500">
        <h1 className="text-xl font-bold">Translation History</h1>
        <span className="text-sm">Total: {history.length} records</span>

        <select
          className="px-2 py-1 bg-blue-600 rounded"
          value={targetLanguage}
          onChange={(e) => {
            const selectedLanguage = e.target.value
            chrome.storage.local.set({ targetLanguage: selectedLanguage }, () => {
              setTargetLanguage(selectedLanguage)
            })
          }}
        >
          {Object.entries(tl).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>

        <button
          className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
          onClick={() => {
            setShowInverted((prev) => !prev)
          }}
        >
          <SwapIcon title="Swap" className="w-5 h-5" />
        </button>

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
              <div key={item.timestamp} className="group relative rounded-md bg-white">
                <FlashCard title={showInverted ? item.translation.trans?.toLowerCase() : item.text}>
                  <DictoPopup {...item.translation} showOrig expanded maxWidth="none" />
                </FlashCard>
                <button
                  className="absolute right-2 top-2 rounded px-2 py-1 text-sm text-slate-400 opacity-0 hover:bg-red-50 hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
                  onClick={() => handleDeleteItem(item, index)}
                  title="Delete"
                  aria-label={`Delete ${item.text}`}
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No translation history available.</p>
        )}
      </div>
      {deleted && (
        <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-md bg-slate-800 px-4 py-3 text-sm text-white shadow-lg">
          <span>
            Deleted <strong>{deleted.item.text}</strong>
          </span>
          <button className="font-semibold text-blue-300 hover:text-blue-200" onClick={handleUndo}>
            Undo
          </button>
        </div>
      )}
    </main>
  )
}

export default Options
