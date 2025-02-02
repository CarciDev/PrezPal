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
} from "recharts";
import { getSummary } from "./services/summaryService";

const AnalyzerChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const summary = getSummary();
    console.log(summary);
  }, [isOpen]);

  return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-blue text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        aria-label="Open Analyzer"
      >
        <BarChart2 className="w-6 h-6 bg-blue text-white" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col border border-gray-200">
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
            <p className="text-gray-600">
              <LineChart
                width={320}
                height={250}
                data={data}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pv"
                  stroke="#8884d8"
                  name="Pace"
                />
                <Line
                  type="monotone"
                  dataKey="uv"
                  stroke="#82ca9d"
                  name="Time"
                />
              </LineChart>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AnalyzerChat;
