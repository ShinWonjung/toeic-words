import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import {
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore'

function useProgress(userId, wordbookId) {
  const [progress, setProgress] = useState({})

  // Firestore에서 진도 불러오기
  useEffect(() => {
    if (!userId || !wordbookId) return
    const fetchProgress = async () => {
      const ref = doc(db, 'users', userId, 'progress', wordbookId)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        setProgress(snap.data())
      }
    }
    fetchProgress()
  }, [userId, wordbookId])

  // 단어 상태 업데이트
  const updateStatus = async (wordId, status) => {
    const updated = { ...progress, [wordId]: status }
    setProgress(updated)
    if (userId) {
      const ref = doc(db, 'users', userId, 'progress', wordbookId)
      await setDoc(ref, updated)
    }
  }

  const getStatus = (wordId) => {
    return progress[wordId] || 'unseen'
  }

  return { progress, updateStatus, getStatus }
}

export default useProgress
