// src/App.tsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Interpreter from "./pages/Interpreter";
import Recorder from "./pages/Recorder";
import About from "./pages/About";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <nav className="bg-white dark:bg-gray-800 shadow p-4 flex gap-4">
        <Link to="/" className="font-medium hover:underline">Home</Link>
        <Link to="/interpreter" className="font-medium hover:underline">Interpreter</Link>
        <Link to="/recorder" className="font-medium hover:underline">Recorder</Link>
        <Link to="/about" className="font-medium hover:underline">About</Link>
      </nav>
      <main className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interpreter" element={<Interpreter />} />
          <Route path="/recorder" element={<Recorder />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
