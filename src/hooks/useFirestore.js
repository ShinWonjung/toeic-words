import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore'

function useFirestore(userId) {
  const [wordbooks, setWordbooks] = useState([])
  const [loading, setLoading] = useState(true)

  // 단어장 목록 실시간 불러오기
  useEffect(() => {
    if (!userId) return
    const q = query(
      collection(db, 'users', userId, 'wordbooks'),
      orderBy('createdAt', 'asc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
      setWordbooks(data)
      setLoading(false)
    })
    return unsubscribe
  }, [userId])

  // 단어장 추가
  const addWordbook = async (title, description) => {
    await addDoc(collection(db, 'users', userId, 'wordbooks'), {
      title,
      description,
      createdAt: Date.now()
    })
  }

  // 단어장 삭제
  const deleteWordbook = async (wordbookId) => {
    await deleteDoc(doc(db, 'users', userId, 'wordbooks', wordbookId))
  }

  // 단어 추가
  const addWord = async (wordbookId, word) => {
    await addDoc(collection(db, 'users', userId, 'wordbooks', wordbookId, 'words'), {
      ...word,
      createdAt: Date.now()
    })
  }

  // 단어 삭제
  const deleteWord = async (wordbookId, wordId) => {
    await deleteDoc(doc(db, 'users', userId, 'wordbooks', wordbookId, 'words', wordId))
  }

  return { wordbooks, loading, addWordbook, deleteWordbook, addWord, deleteWord }
}

export default useFirestore
