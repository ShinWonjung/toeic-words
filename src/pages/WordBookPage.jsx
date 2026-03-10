import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '../firebase/config'
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore'
import useAuth from '../hooks/useAuth'
import useProgress from '../hooks/useProgress'

function WordBookPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getStatus } = useProgress(user?.uid, id)

  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showAddWord, setShowAddWord] = useState(false)

  // 단어 입력 상태
  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [partOfSpeech, setPartOfSpeech] = useState('noun')
  const [example, setExample] = useState('')
  const [exampleKr, setExampleKr] = useState('')

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

  // 단어 추가
  const handleAddWord = async () => {
    if (!word.trim() || !meaning.trim()) return
    await addDoc(collection(db, 'users', user.uid, 'wordbooks', id, 'words'), {
      word,
      meaning,
      part_of_speech: partOfSpeech,
      example,
      example_kr: exampleKr,
      createdAt: Date.now()
    })
    setWord('')
    setMeaning('')
    setPartOfSpeech('noun')
    setExample('')
    setExampleKr('')
    setShowAddWord(false)
  }

  // 단어 삭제
  const handleDeleteWord = async (wordId) => {
    await deleteDoc(doc(db, 'users', user.uid, 'wordbooks', id, 'words', wordId))
  }

  // 필터링
  const filteredWords = words.filter((w) => {
    if (filter === 'all') return true
    if (filter === 'known') return getStatus(w.id) === 'known'
    if (filter === 'unknown') return getStatus(w.id) === 'unknown'
    if (filter === 'quiz_wrong') return getStatus(w.id) === 'quiz_wrong'
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
        <h1 className="text-2xl font-bold text-gray-800">단어 목록</h1>
      </div>

      {/* 학습/퀴즈 버튼 */}
      <div className="flex gap-2 mb-4">
        <button
          className="flex-1 bg-blue-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-600 transition"
          onClick={() => navigate(`/study/${id}`)}
        >
          학습하기
        </button>
        <button
          className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-green-600 transition"
          onClick={() => navigate(`/quiz/${id}`)}
        >
          퀴즈
        </button>
      </div>

      {/* 단어 추가 버튼 */}
      <button
        onClick={() => setShowAddWord(!showAddWord)}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 font-semibold hover:border-blue-400 hover:text-blue-400 transition mb-4"
      >
        + 단어 추가
      </button>

      {/* 단어 추가 폼 */}
      {showAddWord && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <input
            type="text"
            placeholder="영어 단어 (예: negotiate)"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm mb-3 outline-none focus:border-blue-400"
          />
          <input
            type="text"
            placeholder="뜻 (예: 협상하다)"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm mb-3 outline-none focus:border-blue-400"
          />
          <select
            value={partOfSpeech}
            onChange={(e) => setPartOfSpeech(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm mb-3 outline-none focus:border-blue-400"
          >
            <option value="noun">명사 (noun)</option>
            <option value="verb">동사 (verb)</option>
            <option value="adjective">형용사 (adjective)</option>
            <option value="adverb">부사 (adverb)</option>
          </select>
          <input
            type="text"
            placeholder="예문 (선택사항)"
            value={example}
            onChange={(e) => setExample(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm mb-3 outline-none focus:border-blue-400"
          />
          <input
            type="text"
            placeholder="예문 한글 해석 (선택사항)"
            value={exampleKr}
            onChange={(e) => setExampleKr(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm mb-3 outline-none focus:border-blue-400"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddWord(false)}
              className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-400 text-sm font-semibold hover:bg-gray-50 transition"
            >
              취소
            </button>
            <button
              onClick={handleAddWord}
              className="flex-1 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition"
            >
              추가
            </button>
          </div>
        </div>
      )}

      {/* 필터 */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {[
          { key: 'all', label: '전체' },
          { key: 'known', label: '아는 단어' },
          { key: 'unknown', label: '모르는 단어' },
          { key: 'quiz_wrong', label: '퀴즈 오답' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition
              ${filter === f.key ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 단어 리스트 */}
      {loading ? (
        <p className="text-center text-gray-400 mt-10">로딩 중...</p>
      ) : filteredWords.length === 0 ? (
        <p className="text-center text-gray-400 mt-10">단어를 추가해보세요!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredWords.map((w) => {
            const status = getStatus(w.id)
            return (
              <div key={w.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-lg font-bold text-gray-800">{w.word}</span>
                  <div className="flex items-center gap-2">
                    {status === 'known' && <span className="text-xs bg-blue-100 text-blue-500 px-2 py-0.5 rounded-full">알아요</span>}
                    {status === 'unknown' && <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full">몰라요</span>}
                    {status === 'quiz_wrong' && <span className="text-xs bg-yellow-100 text-yellow-500 px-2 py-0.5 rounded-full">오답</span>}
                    <button
                      onClick={() => handleDeleteWord(w.id)}
                      className="text-gray-300 hover:text-red-400 transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-400">{w.part_of_speech}</p>
                <p className="text-gray-600 mt-1">{w.meaning}</p>
                {w.example && <p className="text-sm text-gray-400 mt-2 italic">{w.example}</p>}
                {w.example_kr && <p className="text-sm text-gray-300">{w.example_kr}</p>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default WordBookPage
