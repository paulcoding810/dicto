const maxLength = 5e3

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('background received a message:', request)
  if (request.type === 'COUNT') {
    console.log('background has received a message from popup, and count is ', request?.count)
  }
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
    {
      credentials: 'include',
      headers: {
        'User-Agent': 'Test',
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
    },
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = await response.json()
  console.log('Translation result:', data)
  return data
}
