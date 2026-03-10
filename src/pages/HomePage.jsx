import { useNavigate } from 'react-router-dom'
import wordsData from '../data/words.json'

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📚 토익 단어장</h1>
        <p className="text-gray-500 mt-1">단어장을 선택해서 공부를 시작하세요!</p>
      </div>

      {/* 단어장 리스트 */}
      <div className="flex flex-col gap-4">
        {wordsData.map((book) => {
          const total = book.words.length
          return (
            <div
              key={book.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition"
              onClick={() => navigate(`/wordbook/${book.id}`)}
            >
              {/* 제목 & 설명 */}
              <h2 className="text-xl font-bold text-gray-800">{book.title}</h2>
              <p className="text-gray-400 text-sm mt-1">{book.description}</p>

              {/* 단어 개수 */}
              <p className="text-gray-500 text-sm mt-3">총 {total}개 단어</p>

              {/* 버튼 */}
              <div className="flex gap-2 mt-4">
                <button
                  className="flex-1 bg-blue-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-600 transition"
                  onClick={(e) => { e.stopPropagation(); navigate(`/study/${book.id}`) }}
                >
                  학습하기
                </button>
                <button
                  className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-green-600 transition"
                  onClick={(e) => { e.stopPropagation(); navigate(`/quiz/${book.id}`) }}
                >
                  퀴즈
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default HomePage