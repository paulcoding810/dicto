import { useEffect, useState } from 'react'

const steps = [
  ['Select text', 'Highlight any word or sentence on a web page.'],
  ['Press Shift twice', 'A popup shows the translation, definitions and examples.'],
  ['Skip history', 'Hold Ctrl, Cmd or Opt while pressing Shift twice to translate without saving.'],
  ['Listen', 'Click 🔉 for the browser voice or 🔊 for the Google voice.'],
  ['Review', 'Click the Dicto icon to open your history. Click a card to reveal it, swipe left to delete.'],
]

export default function Tutorial() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    chrome.storage.local.get(['tutorialSeen'], (result) => {
      setOpen(!result.tutorialSeen)
    })
  }, [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  const close = () => {
    setOpen(false)
    chrome.storage.local.set({ tutorialSeen: true })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-slate-700 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900">Welcome to Dicto</h2>
        <ol className="mt-4 space-y-3">
          {steps.map(([title, text], i) => (
            <li key={title} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-slate-900">{title}</p>
                <p className="text-sm">{text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 rounded bg-blue-50 p-3 text-sm">
          Try it now: select <strong>serendipity</strong> and press Shift twice.
        </p>
        <button
          className="mt-5 w-full rounded bg-blue-500 py-2 font-semibold text-white hover:bg-blue-600"
          onClick={close}
        >
          Got it
        </button>
      </div>
    </div>
  )
}
