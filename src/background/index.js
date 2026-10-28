import { bindConsoleTag } from '../utils/console'
import { parseResult } from '../utils/translate'

const maxLength = 5e3
const maxHistory = 1000
const requestOptions = {
  headers: {
    'User-Agent': 'GoogleTranslate/dicto', // need to set a custom User-Agent to avoid being blocked
    Accept: '*/*',
    'Accept-Language': 'en-GB,en;q=0.5',
    'Alt-Used': 'translate.google.com',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    Priority: 'u=4',
  },
  method: 'GET',
  mode: 'cors',
}

bindConsoleTag('[dicto]')

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: chrome.runtime.getURL('options.html') })
})

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== 'install' && reason !== 'update') return
  const { tutorialSeen } = await chrome.storage.local.get(['tutorialSeen'])
  if (!tutorialSeen) {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') })
  }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'translate':
      translateSelection(request.text)
        .then((result) => {
          if (request.shouldSave) {
            saveHistory(request.text, parseResult(result))
          }
          sendResponse({ success: true, result })
        })
        .catch((error) => {
          console.error('Error handling translate request:', error)
          sendResponse({ success: false, error: error.message })
        })
      break
    case 'tts':
      tts(request.text, request.src)
        .then((base64Audio) => {
          sendResponse({ success: true, result: base64Audio })
        })
        .catch((error) => {
          console.error('Error handling TTS request:', error)
          sendResponse({ success: false, error: error.message })
        })
      break
    default:
      console.warn('Unknown message type:', request.type)
  }
  return true // Keep the message channel open for sendResponse
})

async function translateSelection(text) {
  if (!text) {
    throw new Error('No text provided for translation.')
  }
  if (text.length > maxLength) {
    throw new Error(`Text exceeds maximum length of ${maxLength} characters.`)
  }

  const target = (await chrome.storage.local.get(['targetLanguage']))?.targetLanguage || 'vi'

  const response = await fetch(
    `https://translate.google.com/translate_a/single?q=${encodeURIComponent(text)}&sl=auto&tl=${target}&hl=en&client=it&otf=2&dj=1&ie=UTF-8&oe=UTF-8&dt=t&dt=rmt&dt=bd&dt=rms&dt=qca&dt=ss&dt=md&dt=ld&dt=ex&dt=rw`,
    requestOptions,
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = await response.json()
  return data
}

async function tts(text, src = 'en-US') {
  if (!text || text.length === 0) {
    throw new Error('No text provided for TTS.')
  }

  const response = await fetch(
    `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&sl=${src}&tl=${src}&client=it`,
    requestOptions,
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const blob = await response.blob()
  const base64Audio = await blobToBase64(blob)
  return base64Audio
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(blob)
  })
}

// serialize writes so concurrent saves don't overwrite each other
let saveQueue = Promise.resolve()

function saveHistory(text, translation) {
  if (!text || text.length === 0) {
    console.warn('No text provided for history saving.')
    return
  }

  if (text.split(' ').length > 100) {
    console.warn('Text exceeds maximum word count for history saving.')
    return
  }

  saveQueue = saveQueue
    .then(async () => {
      const { history = [] } = await chrome.storage.local.get(['history'])
      // move a repeated word to the top instead of saving it twice
      const updated = [
        { text, translation, timestamp: Date.now() },
        ...history.filter((item) => item.text !== text),
      ].slice(0, maxHistory)
      await chrome.storage.local.set({ history: updated })
    })
    .catch((error) => console.error('Error saving history:', error))
}

function getBrowserName() {
  if (typeof browser !== 'undefined' && typeof browser.runtime !== 'undefined') {
    return 'firefox'
  }
  if (typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined') {
    return 'chrome'
  }
  return 'unknown'
}
