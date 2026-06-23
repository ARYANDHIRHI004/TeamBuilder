import React from 'react'

const NavBar = () => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <button
        //   onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          ← Back to My Teams
        </button>
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg shadow-sm">🔔</div>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">AV</div>
            <div>
              <p className="text-sm font-semibold text-gray-800 leading-none">Aryan Verma</p>
              <p className="text-xs text-gray-400">Student</p>
            </div>
            <span className="text-gray-400 text-xs ml-1">▾</span>
          </div>
        </div>
      </div>
  )
}

export default NavBar