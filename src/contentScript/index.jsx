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

const doubleShiftDelay = 400
let lastShiftTime = 0

const popupMargin = 8

// on double shift, send current selected text to background script
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && popups.length > 0) {
    removeAllPopups()
  }
  if (event.key !== 'Shift') {
    lastShiftTime = 0
    return
  }
  if (event.repeat) return

  const now = Date.now()
  if (now - lastShiftTime > doubleShiftDelay) {
    lastShiftTime = now
    return
  }
  lastShiftTime = 0

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

  const anchorRect =
    anchorNode.nodeType !== Node.TEXT_NODE
      ? anchorNode.getBoundingClientRect()
      : selection.getRangeAt(0).getBoundingClientRect()

  const popup = showPopup(anchorRect)
  popup.render({ loading: true })

  try {
    chrome.runtime.sendMessage(
      {
        type: 'translate',
        text: selectedText,
        shouldSave: !event.ctrlKey && !event.metaKey && !event.altKey, // Save unless Ctrl/Cmd/Opt is pressed
      },
      (response) => {
        if (response && response.success) {
          popup.render(parseResult(response.result))
        } else {
          console.error('Failed to send translation request:', response)
          popup.render({ error: "Couldn't translate. Please try again." })
        }
      },
    )
  } catch (error) {
    console.error('Failed to send translation request:', error)
    popup.render({ error: 'Dicto was updated. Reload this page to keep translating.' })
  }
})

// add click event to hide all popups when clicking outside
document.addEventListener('click', (event) => {
  if (popups.length > 0 && !popups.some(({ element }) => element.contains(event.target))) {
    removeAllPopups()
  }
})

function removeAllPopups() {
  popups.splice(0).forEach(({ element, root, observer }) => {
    observer.disconnect()
    root.unmount()
    element.remove()
  })
}

// keep the popup inside the viewport, flipping above the selection when there is no room below
function placePopup(element, anchorRect) {
  const { width, height } = element.getBoundingClientRect()
  const maxLeft = window.innerWidth - width - popupMargin
  const left = Math.max(popupMargin, Math.min(anchorRect.left, maxLeft))

  const below = anchorRect.bottom + popupMargin
  const above = anchorRect.top - height - popupMargin
  const top = below + height > window.innerHeight && above >= 0 ? above : below

  element.style.left = `${left + window.scrollX}px`
  element.style.top = `${top + window.scrollY}px`
}

function showPopup(anchorRect) {
  removeAllPopups()

  const rootElement = document.createElement('div')
  rootElement.className = 'dicto-container'
  Object.assign(rootElement.style, {
    maxWidth: '20rem',
    zIndex: '9999',
    position: 'absolute',
  })
  document.body.appendChild(rootElement)

  // Render the React component in Shadow DOM
  const shadowRoot = rootElement.attachShadow({ mode: 'open' })
  const shadowContainer = document.createElement('div')
  shadowRoot.appendChild(shadowContainer)

  const root = createRoot(shadowContainer)
  const observer = new ResizeObserver(() => placePopup(rootElement, anchorRect))
  observer.observe(rootElement)

  const popup = { element: rootElement, root, observer }
  popups.push(popup)
  placePopup(rootElement, anchorRect)

  return {
    render(props) {
      // ignore late responses for a popup that was already closed
      if (!popups.includes(popup)) return
      root.render(<DictoPopup {...props} onClose={removeAllPopups} />)
    },
  }
}
