import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import useAuth from '../hooks/useAuth'
import useProgress from '../hooks/useProgress'

function StudyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getStatus, updateStatus } = useProgress(user?.uid, id)

  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  // Firestore에서 단어 불러오기
  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'users', user.uid, 'wordbooks', id, 'words'),
      orderBy('createdAt', 'asc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setWords(data)
      setLoading(false)
    })
    return unsubscribe
  }, [user, id])

  if (loading) return <p className="text-center text-gray-400 mt-10">로딩 중...</p>
  if (words.length === 0) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <p className="text-gray-400 mb-4">등록된 단어가 없어요!</p>
      <button onClick={() => navigate(`/wordbook/${id}`)} className="text-blue-500">← 단어 추가하러 가기</button>
    </div>
  )

  const currentWord = words[currentIndex]

  // 발음 듣기
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    window.speechSynthesis.speak(utterance)
  }

  // 다음 단어
  const goNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  // 이전 단어
  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  // 아는 단어 / 모르는 단어
  const handleStatus = (status) => {
    updateStatus(currentWord.id, status)
    goNext()
  }

  const status = getStatus(currentWord.id)

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/wordbook/${id}`)} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
        <h1 className="text-xl font-bold text-gray-800">학습</h1>
        <span className="ml-auto text-gray-400 text-sm">{currentIndex + 1} / {words.length}</span>
      </div>

      {/* 진도 바 */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      {/* 플래시카드 */}
      <div
        className="flex-1 flex items-center justify-center cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="w-full bg-white rounded-3xl shadow-md p-8 min-h-64 flex flex-col items-center justify-center text-center border border-gray-100">
          {!isFlipped ? (
            <div>
              <p className="text-sm text-gray-400 mb-4">카드를 클릭해서 뜻 확인하기</p>
              <h2 className="text-4xl font-bold text-gray-800">{currentWord.word}</h2>
              <p className="text-gray-400 text-sm mt-3">{currentWord.part_of_speech}</p>
              <button
                className="mt-6 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-500 hover:bg-gray-200 transition"
                onClick={(e) => { e.stopPropagation(); speak(currentWord.word) }}
              >
                🔊 발음 듣기
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-bold text-blue-500">{currentWord.meaning}</h2>
              {currentWord.example && <p className="text-gray-500 mt-4 italic">{currentWord.example}</p>}
              {currentWord.example_kr && <p className="text-gray-400 text-sm mt-2">{currentWord.example_kr}</p>}
            </div>
          )}
        </div>
      </div>

      {/* 상태 뱃지 */}
      <div className="flex justify-center mt-4">
        {status === 'known' && <span className="text-xs bg-blue-100 text-blue-500 px-3 py-1 rounded-full">알아요 ✅</span>}
        {status === 'unknown' && <span className="text-xs bg-red-100 text-red-500 px-3 py-1 rounded-full">몰라요 ❌</span>}
        {status === 'quiz_wrong' && <span className="text-xs bg-yellow-100 text-yellow-500 px-3 py-1 rounded-full">오답 ⚠️</span>}
      </div>

      {/* 버튼 영역 */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-400 font-semibold disabled:opacity-30 hover:bg-gray-100 transition"
        >
          ← 이전
        </button>
        <button
          onClick={() => handleStatus('unknown')}
          className="flex-1 py-3 rounded-2xl bg-red-100 text-red-500 font-semibold hover:bg-red-200 transition"
        >
          몰라요 👎
        </button>
        <button
          onClick={() => handleStatus('known')}
          className="flex-1 py-3 rounded-2xl bg-blue-100 text-blue-500 font-semibold hover:bg-blue-200 transition"
        >
          알아요 👍
        </button>
        <button
          onClick={goNext}
          disabled={currentIndex === words.length - 1}
          className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-400 font-semibold disabled:opacity-30 hover:bg-gray-100 transition"
        >
          다음 →
        </button>
      </div>
    </div>
  )
}

export default StudyPage
