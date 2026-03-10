import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import useAuth from '../hooks/useAuth'
import useProgress from '../hooks/useProgress'

function QuizPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getStatus, updateStatus } = useProgress(user?.uid, id)

  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

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

  // 퀴즈 문제 생성
  const questions = useMemo(() => {
    if (words.length < 4) return []
    return words.map((word) => {
      const wrongChoices = words
        .filter((w) => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((w) => w.meaning)
      const choices = [...wrongChoices, word.meaning].sort(() => Math.random() - 0.5)
      return { word, choices, answer: word.meaning }
    })
  }, [words])

  if (loading) return <p className="text-center text-gray-400 mt-10">로딩 중...</p>

  if (words.length < 4) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <p className="text-gray-400 mb-4">퀴즈는 단어가 4개 이상 필요해요!</p>
      <button onClick={() => navigate(`/wordbook/${id}`)} className="text-blue-500">← 단어 추가하러 가기</button>
    </div>
  )

  const currentQuestion = questions[currentIndex]

  const handleSelect = (choice) => {
    if (selected) return
    setSelected(choice)
    const isCorrect = choice === currentQuestion.answer
    if (isCorrect) {
      setScore(score + 1)
      if (getStatus(currentQuestion.word.id) === 'quiz_wrong') {
        updateStatus(currentQuestion.word.id, 'known')
      }
    } else {
      updateStatus(currentQuestion.word.id, 'quiz_wrong')
    }
  }

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelected(null)
    } else {
      setIsFinished(true)
    }
  }

  // 결과 화면
  if (isFinished) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-md p-8 w-full text-center">
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">퀴즈 완료!</h2>
          <p className="text-gray-400 mb-6">결과를 확인해보세요</p>
          <p className="text-5xl font-bold text-blue-500 mb-2">{score} / {questions.length}</p>
          <p className="text-gray-400 text-sm mb-8">정답률 {Math.round((score / questions.length) * 100)}%</p>
          <div className="flex gap-3">
            <button
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition"
              onClick={() => navigate(`/wordbook/${id}`)}
            >
              단어 리스트
            </button>
            <button
              className="flex-1 py-3 rounded-2xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
              onClick={() => navigate(`/study/${id}`)}
            >
              다시 학습하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/wordbook/${id}`)} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
        <h1 className="text-xl font-bold text-gray-800">퀴즈</h1>
        <span className="ml-auto text-gray-400 text-sm">{currentIndex + 1} / {questions.length}</span>
      </div>

      {/* 진도 바 */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-green-500 h-2 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* 문제 */}
      <div className="bg-white rounded-3xl shadow-md p-8 text-center mb-6 border border-gray-100">
        <p className="text-sm text-gray-400 mb-4">이 단어의 뜻은?</p>
        <h2 className="text-4xl font-bold text-gray-800">{currentQuestion.word.word}</h2>
        <p className="text-gray-400 text-sm mt-2">{currentQuestion.word.part_of_speech}</p>
      </div>

      {/* 보기 */}
      <div className="flex flex-col gap-3">
        {currentQuestion.choices.map((choice, index) => {
          let style = 'bg-white border border-gray-200 text-gray-700'
          if (selected) {
            if (choice === currentQuestion.answer) style = 'bg-green-100 border-green-400 text-green-700'
            else if (choice === selected) style = 'bg-red-100 border-red-400 text-red-700'
          }
          return (
            <button
              key={index}
              onClick={() => handleSelect(choice)}
              className={`w-full py-4 px-5 rounded-2xl text-left font-semibold transition ${style}`}
            >
              {index + 1}. {choice}
            </button>
          )
        })}
      </div>

      {/* 다음 버튼 */}
      {selected && (
        <button
          onClick={goNext}
          className="mt-6 w-full py-3 rounded-2xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
        >
          {currentIndex < questions.length - 1 ? '다음 문제 →' : '결과 보기'}
        </button>
      )}
    </div>
  )
}

export default QuizPage
