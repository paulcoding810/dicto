import { useState } from 'react'

const SwipeableItem = ({ item, onDelete, children }) => {
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    const currentXPos = e.touches[0].clientX
    const diff = currentXPos - startX

    // Only allow left swipe (negative diff)
    if (diff < 0) {
      setCurrentX(diff)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)

    // If swiped more than 200px to the left, trigger delete
    if (currentX < -200) {
      setIsDeleting(true)
      setTimeout(() => {
        onDelete(item)
        setIsDeleting(false)
        setCurrentX(0)
      }, 300)
    } else {
      // Reset position
      setCurrentX(0)
    }
  }

  const handleMouseDown = (e) => {
    setStartX(e.clientX)
    setIsDragging(true)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const diff = e.clientX - startX

    // Only allow left swipe (negative diff)
    if (diff < 0) {
      setCurrentX(diff)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)

    // If swiped more than 200px to the left, trigger delete
    if (currentX < -200) {
      setIsDeleting(true)
      setTimeout(() => {
        onDelete(item)
        setIsDeleting(false)
        setCurrentX(0)
      }, 300)
    } else {
      // Reset position
      setCurrentX(0)
    }
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{
        transform: `translateX(${currentX}px)`,
        transition: isDeleting
          ? 'transform 0.3s ease-out, opacity 0.3s ease-out'
          : 'transform 0.2s ease-out',
        opacity: isDeleting ? 0 : 1,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="relative bg-white">{children}</div>
    </div>
  )
}

export default SwipeableItem
