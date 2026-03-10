import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import WordBookPage from './pages/WordBookPage'
import StudyPage from './pages/StudyPage'
import QuizPage from './pages/QuizPage'  // ← 추가

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wordbook/:id" element={<WordBookPage />} />
        <Route path="/study/:id" element={<StudyPage />} />
        <Route path="/quiz/:id" element={<QuizPage />} />  {/* ← 변경 */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
