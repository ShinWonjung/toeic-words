import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuth from './hooks/useAuth'
import HomePage from './pages/HomePage'
import WordBookPage from './pages/WordBookPage'
import StudyPage from './pages/StudyPage'
import QuizPage from './pages/QuizPage'

function App() {
  const { user, loading, login } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-md p-10 w-full max-w-sm text-center">
          <p className="text-5xl mb-4">📚</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">토익 단어장</h1>
          <p className="text-gray-400 text-sm mb-8">구글 로그인 후 이용할 수 있어요</p>
          <button
            onClick={login}
            className="w-full py-3 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 transition"
          >
            Google로 로그인
          </button>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wordbook/:id" element={<WordBookPage />} />
        <Route path="/study/:id" element={<StudyPage />} />
        <Route path="/quiz/:id" element={<QuizPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
