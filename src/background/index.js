const maxLength = 5e3
const requestOptions = {
  credentials: 'include',
  headers: {
    'User-Agent': 'GoogleTranslate', // need to set a custom User-Agent to avoid being blocked
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'translate':
      translateSelection(request)
        .then((result) => {
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

async function translateSelection(request) {
  if (!request.text) {
    throw new Error('No text provided for translation.')
  }
  if (request.text.length > maxLength) {
    throw new Error(`Text exceeds maximum length of ${maxLength} characters.`)
  }

  const response = await fetch(
    `https://translate.google.com/translate_a/single?q=${encodeURIComponent(request.text)}&sl=auto&tl=vi&hl=en&client=it&otf=2&dj=1&ie=UTF-8&oe=UTF-8&dt=t&dt=rmt&dt=bd&dt=rms&dt=qca&dt=ss&dt=md&dt=ld&dt=ex&dt=rw`,
    requestOptions,
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}}`)
  }
  const data = await response.json()
  return data
}

async function tts(text, src = 'en-US') {
  if (!text || text.length === 0) {
    throw new Error('No text provided for TTS.')
  }

  const response = await fetch(
    `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&sl=${src}&tl=en&client=it`,
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
