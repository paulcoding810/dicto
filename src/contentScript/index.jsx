import { createRoot } from 'react-dom/client'
import DictoPopup from './DictoPopup'
import { parseResult } from '../utils/translate'

// on press shift, send current selected text to background script
document.addEventListener('keydown', (event) => {
  if (event.shiftKey) {
    const selection = window.getSelection()
    const position =
      selection.anchorNode.nodeType !== Node.TEXT_NODE
        ? selection.anchorNode.getBoundingClientRect()
        : selection.getRangeAt(0).getBoundingClientRect()

    const selectedText = selection.toString().trim()

    if (selectedText) {
      chrome.runtime.sendMessage(
        {
          type: 'translate',
          text: selectedText,
        },
        (response) => {
          if (response && response.success) {
            console.log('Translation request sent successfully:', response.result)
            showTranslationResult(response.result, position)
          } else {
            console.error('Failed to send translation request:', response)
          }
        },
      )
    } else {
      console.warn('No text selected for translation.')
    }
  }
})

// add click event to hide all popups when clicking outside
document.addEventListener('click', (event) => {
  const popup = document.querySelector('.dicto-container')
  if (popup && !popup.contains(event.target)) {
    removeAllPopups()
  }
})

function removeAllPopups() {
  const popups = document.querySelectorAll('.dicto-container')
  popups.forEach((popup) => {
    popup.remove()
  })
  console.log('All popups removed.')
}

function showTranslationResult(result, position) {
  // Create a container element
  const rootElement = document.createElement('div')
  rootElement.className = 'dicto-container'
  Object.assign(rootElement.style, {
    maxWidth: '20rem',
    top: `${position.top + position.height + window.scrollY}px`,
    left: `${position.left + window.scrollX}px`,
    zIndex: '9999',
    position: 'absolute',
  })
  document.body.appendChild(rootElement)

  // Render the React component in Shadow DOM
  const shadowRoot = rootElement.attachShadow({ mode: 'open' })
  const shadowContainer = document.createElement('div')
  shadowRoot.appendChild(shadowContainer)

  const root = createRoot(shadowContainer)
  const translation = parseResult(result)
  root.render(<DictoPopup {...translation} />)
}
