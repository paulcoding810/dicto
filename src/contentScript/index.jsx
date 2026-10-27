import { createRoot } from 'react-dom/client'
import { bindConsoleTag } from '../utils/console'
import { parseResult } from '../utils/translate'
import DictoPopup from './DictoPopup'

bindConsoleTag('[dicto]')

const popups = []

function isEditable(node) {
  return (
    node.nodeName === 'INPUT' ||
    node.nodeName === 'TEXTAREA' ||
    Array.from(node.childNodes).some((e) => e.nodeName === 'TEXTAREA' || e.nodeName === 'INPUT') ||
    node.parentElement?.closest('[contenteditable]') != null
  )
}

// on press shift, send current selected text to background script
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Shift' || event.repeat) return

  const selection = window.getSelection()
  const anchorNode = selection?.anchorNode
  if (!anchorNode || selection.rangeCount === 0) return

  const selectedText = selection.toString().trim().toLowerCase()
  if (!selectedText) {
    console.warn('No text selected for translation.')
    return
  }

  if (isEditable(anchorNode)) {
    console.warn('Selection is in an input or textarea, skipping translation.')
    return
  }

  const position =
    anchorNode.nodeType !== Node.TEXT_NODE
      ? anchorNode.getBoundingClientRect()
      : selection.getRangeAt(0).getBoundingClientRect()

  chrome.runtime.sendMessage(
    {
      type: 'translate',
      text: selectedText,
      shouldSave: !event.ctrlKey && !event.metaKey && !event.altKey, // Save unless Ctrl/Cmd/Opt is pressed
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
})

// add click event to hide all popups when clicking outside
document.addEventListener('click', (event) => {
  if (popups.length > 0 && !popups.some(({ element }) => element.contains(event.target))) {
    removeAllPopups()
  }
})

function removeAllPopups() {
  popups.splice(0).forEach(({ element, root }) => {
    root.unmount()
    element.remove()
  })
}

function showTranslationResult(result, position) {
  removeAllPopups()

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
  popups.push({ element: rootElement, root })
  root.render(<DictoPopup {...parseResult(result)} />)
}
