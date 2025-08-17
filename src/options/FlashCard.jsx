import { useState } from 'react'

export default function FlashCard({ title, children }) {
  const [clicked, setClicked] = useState(false)

  const handleClick = () => {
    setClicked(!clicked)
  }

  return (
    <div onClick={handleClick} className="rounded-md">
      {clicked ? children : <h1 className="p-4 text-lg font-semibold">{title}</h1>}
    </div>
  )
}
