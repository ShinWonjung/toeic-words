import { useState } from 'react'

function useProgress() {
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('progress')
    return saved ? JSON.parse(saved) : {}
  })

  const updateStatus = (wordId, status) => {
    const updated = { ...progress, [wordId]: status }
    setProgress(updated)
    localStorage.setItem('progress', JSON.stringify(updated))
  }

  const getStatus = (wordId) => {
    return progress[wordId] || 'unseen'
  }

  return { progress, updateStatus, getStatus }
}

export default useProgress
