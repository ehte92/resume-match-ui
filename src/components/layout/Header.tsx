export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">
              ResumeMatch AI
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            <button className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Sign In
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
              Sign Up
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
