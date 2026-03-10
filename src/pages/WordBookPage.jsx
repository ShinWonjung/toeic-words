import { useParams, useNavigate } from 'react-router-dom'
import wordsData from '../data/words.json'
import useProgress from '../hooks/useProgress'
import { useState } from 'react'

function WordBookPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getStatus } = useProgress()
  const [filter, setFilter] = useState('all')

  // 해당 단어장 찾기
  const book = wordsData.find((b) => b.id === id)

  // 필터링된 단어 목록
  const filteredWords = book.words.filter((word) => {
    if (filter === 'all') return true
    if (filter === 'known') return getStatus(word.id) === 'known'
    if (filter === 'unknown') return getStatus(word.id) === 'unknown'
    if (filter === 'quiz_wrong') return getStatus(word.id) === 'quiz_wrong'
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
        <h1 className="text-2xl font-bold text-gray-800">{book.title}</h1>
      </div>
      <p className="text-gray-400 text-sm mb-6 ml-8">{book.description}</p>

      {/* 학습/퀴즈 버튼 */}
      <div className="flex gap-2 mb-6">
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
      <div className="flex flex-col gap-3">
        {filteredWords.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">해당하는 단어가 없어요!</p>
        ) : (
          filteredWords.map((word) => {
            const status = getStatus(word.id)
            return (
              <div key={word.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                {/* 단어 & 상태 뱃지 */}
                <div className="flex justify-between items-center mb-1">
                  <span className="text-lg font-bold text-gray-800">{word.word}</span>
                  {status === 'known' && <span className="text-xs bg-blue-100 text-blue-500 px-2 py-0.5 rounded-full">알아요</span>}
                  {status === 'unknown' && <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full">몰라요</span>}
                  {status === 'quiz_wrong' && <span className="text-xs bg-yellow-100 text-yellow-500 px-2 py-0.5 rounded-full">오답</span>}
                </div>
                {/* 품사 & 뜻 */}
                <p className="text-sm text-gray-400">{word.part_of_speech}</p>
                <p className="text-gray-600 mt-1">{word.meaning}</p>
                {/* 예문 */}
                <p className="text-sm text-gray-400 mt-2 italic">{word.example}</p>
                <p className="text-sm text-gray-300">{word.example_kr}</p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default WordBookPage
