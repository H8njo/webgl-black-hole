function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4 animate-pulse">
          블랙홀 효과
        </h1>
        <p className="text-xl text-blue-200 mb-8">
          WebGL과 Tailwind CSS 4로 구현된 블랙홀 시각화
        </p>
        <div className="space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200">
            시작하기
          </button>
          <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 font-bold py-3 px-6 rounded-lg transition-all duration-200">
            더 알아보기
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
