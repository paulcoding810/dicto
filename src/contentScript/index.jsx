import { createRoot } from 'react-dom/client'
import DictoPopup from './DictoPopup'

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

  // Render the React component
  const root = createRoot(rootElement)
  const translation = parseResult(result)
  root.render(<DictoPopup {...translation} />)
}

function parseResult(result) {
  const { sentences, dict, synsets, definitions, examples: exampleList, src } = result
  const trans = sentences?.[0]?.trans
  const orig = sentences?.[0]?.orig
  const translit = sentences?.[1]?.src_translit
  const synonyms = synsets?.[0]?.entry?.[0]?.synonym
  const definition = definitions?.[0]?.entry?.[0]?.gloss
  const examples = exampleList?.example?.map((ex) => ex.text)
  return {
    trans,
    dict,
    orig,
    translit,
    examples,
    definition,
    synonyms,
    src,
  }
}
