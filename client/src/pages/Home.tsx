// src/pages/Home.tsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const features = [
  {
    title: "On‑device privacy",
    description: "All video processing stays in the browser – nothing is uploaded.",
  },
  {
    title: "Two‑way communication",
    description: "Live captions for the signer and speech‑to‑text for the listener.",
  },
  {
    title: "Smart sentences",
    description: "Glosses are smoothed into natural English using Azure OpenAI (or browser fallback).",
  },
];

const Home: React.FC = () => {
  return (
    <section className="max-w-5xl mx-auto py-12 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400">
          SignBridge
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Real‑time sign‑language interpretation in the browser.
        </p>
        <Link
          to="/interpreter"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Start Interpreter <ArrowRight size={20} />
        </Link>
      </div>

      {/* Feature cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
              {f.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Home;
