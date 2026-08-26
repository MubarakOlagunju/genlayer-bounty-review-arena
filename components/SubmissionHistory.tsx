"use client";

import { useSubmitWork } from "../lib/hooks/useBounty";

export default function SubmissionHistory() {
  const { submissions } = useSubmitWork();

  if (!submissions || submissions.length === 0) {
    return null; 
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-4">
      <h2 className="text-2xl font-bold text-white mb-6">Your Past Submissions</h2>
      
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
        <div className="space-y-4">
          {submissions.map((sub: any) => (
            <div 
              key={sub.id} 
              className="bg-black border border-gray-800 rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:border-gray-700"
            >
              <div className="flex-1 overflow-hidden">
                <h4 className="text-lg font-semibold text-white truncate">{sub.title}</h4>
                <a 
                  href={sub.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-400 hover:text-blue-300 text-sm mt-1 block truncate"
                >
                  {sub.url}
                </a>
                <p className="text-gray-500 text-xs mt-2">{sub.date}</p>
              </div>
              
              <div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide border ${
                  sub.status === "Evaluated & Paid" 
                    ? "bg-green-900/30 text-green-400 border-green-800/50"
                    : sub.status === "AI Rejected"
                    ? "bg-red-900/30 text-red-400 border-red-800/50"
                    : "bg-gray-800 text-gray-300 border-gray-700"
                }`}>
                  {sub.status === "Evaluated & Paid" ? "✓ Evaluated & Paid" : `✗ ${sub.status}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}