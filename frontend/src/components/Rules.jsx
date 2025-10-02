import React, { useState } from "react";
import Interview from "./InterviewChat";


export default function Rules({token}) {
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const [start , setStart] = useState(false);
//   const token = token;

  const handleProceed = () => {
    if (!checked) {
      setError("⚠️ You must agree to the rules before proceeding.");
      return;
    }
    setError("");
    setStart(true);
  };

  return (
    <div className="flex items-center justify-center min-h-96 bg-gray-100 px-4">
        {!start ? (
            <div className="bg-white shadow-md rounded-2xl p-6 max-w-xl w-full">
        <h2 className="text-xl font-bold mb-4 text-center text-blue-700">
          Examination Rules
        </h2>

        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
          <li>No electronic devices are allowed.</li>
          <li>Maintain silence inside the exam hall.</li>
          <li>Do not communicate with other candidates.</li>
          <li>Carry your admit card and valid ID proof.</li>
          <li>Complete the exam within the given time limit.</li>
        </ul>

        {/* Checkbox */}
        <div className="flex items-center space-x-2">
          <input
            id="agree"
            type="checkbox"
            checked={checked}
            onChange={() => setChecked(!checked)}
            className="w-4 h-4"
          />
          <label htmlFor="agree" className="text-gray-800 text-sm">
            I have read and agree to abide by the rules.
          </label>
        </div>

        {/* Error message */}
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

        {/* Proceed Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleProceed}
            className={`px-5 py-2 rounded-lg font-medium text-white transition ${
              checked
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Start the Interview
          </button>
        </div>
      </div>
        ): <Interview token={token} />}
    </div>
  );
}
