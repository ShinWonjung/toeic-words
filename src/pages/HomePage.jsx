import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useFirestore from '../hooks/useFirestore'

function HomePage() {
  const { user, logout } = useAuth()
  const { wordbooks, loading, addWordbook, deleteWordbook } = useFirestore(user?.uid)
  const navigate = useNavigate()

  const [showAddWordbook, setShowAddWordbook] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleAddWordbook = async () => {
    if (!title.trim()) return
    await addWordbook(title, description)
    setTitle('')
    setDescription('')
    setShowAddWordbook(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-gray-800">📚 토익 단어장</h1>
        <button
          onClick={logout}
          className="text-sm text-gray-400 hover:text-gray-600 transition"
        >
          로그아웃
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-8">안녕하세요, {user?.displayName}님! 👋</p>

      {/* 단어장 추가 버튼 */}
      <button
        onClick={() => setShowAddWordbook(!showAddWordbook)}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 font-semibold hover:border-blue-400 hover:text-blue-400 transition mb-4"
      >
        + 새 단어장 추가
      </button>

      {/* 단어장 추가 폼 */}
      {showAddWordbook && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <input
            type="text"
            placeholder="단어장 제목 (예: DAY 1)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm mb-3 outline-none focus:border-blue-400"
          />
          <input
            type="text"
            placeholder="설명 (예: 인사 및 소개 관련 어휘)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm mb-3 outline-none focus:border-blue-400"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddWordbook(false)}
              className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-400 text-sm font-semibold hover:bg-gray-50 transition"
            >
              취소
            </button>
            <button
              onClick={handleAddWordbook}
              className="flex-1 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition"
            >
              추가
            </button>
          </div>
        </div>
      )}

      {/* 단어장 리스트 */}
      {loading ? (
        <p className="text-center text-gray-400 mt-10">로딩 중...</p>
      ) : wordbooks.length === 0 ? (
        <p className="text-center text-gray-400 mt-10">단어장을 추가해보세요!</p>
      ) : (
        <div className="flex flex-col gap-4">
          {wordbooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition"
              onClick={() => navigate(`/wordbook/${book.id}`)}
            >
              {/* 제목 & 설명 */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{book.title}</h2>
                  <p className="text-gray-400 text-sm mt-1">{book.description}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteWordbook(book.id) }}
                  className="text-gray-300 hover:text-red-400 transition text-lg"
                >
                  🗑️
                </button>
              </div>

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
          ))}
        </div>
      )}
    </div>
  )
}

export default HomePage
