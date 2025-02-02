import React, { useEffect, useState } from "react";
import { BarChart2, X } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { getSummary } from "./services/summaryService";

const AnalyzerChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [paceData, setPaceData] = useState([]);
  const [wordData, setWordData] = useState([]);
  const [fillerData, setFillerData] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    getSummary().then((summary) => {
      const paceData = summary.times.map((time, index) => ({
        time: time.toFixed(2),
        pace: summary.paces[index].toFixed(2),
      }));
      const topWords = Object.entries(summary.word_frequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([word, count]) => ({ word, count }));
      const topFillers = Object.entries(summary.filler_count)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([word, count]) => ({ word, count }));

      setPaceData(paceData);
      setWordData(topWords);
      setFillerData(topFillers);
    });
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="!fixed !bottom-6 !right-6 !p-4 !bg-blue-500 !text-white !rounded-full !shadow-lg hover:!bg-blue-600 !transition-colors"
        aria-label="Open Analyzer"
      >
        <BarChart2 className="w-6 h-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[800px] h-[500px] bg-white rounded-lg shadow-xl flex flex-col border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-lg">Analyzer Data</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-full"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {/* Speaking Pace Chart */}
              <div className="h-48 bg-white rounded-lg p-4">
                <h4 className="font-semibold mb-2">Speaking Pace Over Time</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={paceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12 }}
                      label={{
                        value: "Time (s)",
                        position: "insideBottom",
                        offset: -5,
                      }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      label={{
                        value: "WPS",
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                      }}
                    />
                    <Tooltip />
                    <Line type="monotone" dataKey="pace" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Top Words and Filler Words Side by Side */}
              <div className="flex space-x-4">
                {/* Top 5 Words */}
                <div className="h-48 bg-white rounded-lg flex-1 p-4">
                  <h4 className="font-semibold mb-2">Top 5 Most Used Words</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={wordData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="word" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Top 3 Filler Words */}
                <div className="h-48 bg-white rounded-lg flex-1 p-4">
                  <h4 className="font-semibold mb-2">Top 3 Filler Words</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fillerData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="word" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnalyzerChat;
