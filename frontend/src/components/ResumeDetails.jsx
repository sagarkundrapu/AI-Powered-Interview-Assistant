import React, { useState } from "react";
import Rules from "./Rules";

export default function ResumeDetails({ parsedData, token }) {
  const [formData, setFormData] = useState({
    name: parsedData?.name || "",
    email: parsedData?.email || "",
    phone: parsedData?.phone || "",
  });
  const [continueToRules, setContinueToRules] = useState(false);
  // const token = token;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    console.log("Final Data:", formData);
    setContinueToRules(true);
    // Navigate to next component or send data to backend
  };

  return (
   <>
    {!continueToRules ? (
      <div className="flex flex-col items-center justify-center  bg-green-50 p-6">
      <div className="bg-white border border-green-200 rounded-lg shadow-md p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold text-green-700 flex items-center mb-4">
          ✅ Resume Parsed Successfully
        </h2>
        <p className="text-gray-600 mb-6">
          Please verify the extracted information and complete any missing/mismatched fields.
        </p>

        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            // disabled={!!parsedData?.name}
            className={`w-full px-3 py-2 border rounded ${
              parsedData?.name ? "bg-gray-100 text-gray-500" : "border-red-400"
            } `}
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            // disabled={!!parsedData?.email}
            className={`w-full px-3 py-2 border rounded ${
              parsedData?.email ? "bg-gray-100 text-gray-500" : "border-red-400"
            }`}
            placeholder="Enter your email"
            required
          />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            // disabled={!!parsedData?.phone}
            className={`w-full px-3 py-2 border rounded ${
              parsedData?.phone ? "bg-gray-100 text-gray-500" : "border-red-400"
            }`}
            placeholder="Enter your phone number"
            required
          />
        </div>

        <button
          onClick={handleNext}
          className="w-full mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Continue to Rules →
        </button>
      </div>
    </div>
    ) : <Rules token={token} />}
   </>
  );
}
