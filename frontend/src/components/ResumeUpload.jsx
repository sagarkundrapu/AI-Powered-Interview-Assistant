import React, { useState } from "react";
import ResumeDetails from "./ResumeDetails";

export default function ResumeUpload({ onUploadSuccess, token }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Allowed file types
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  // Validate file
  const validateFile = (selectedFile) => {
    setError("");
    setSuccess("");
    setResponseData(null);

    if (!selectedFile) {
      setError("Please select a file.");
      return false;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only PDF or DOCX files are allowed.");
      return false;
    }
    return true;
  };

  // Handle file select (browse)
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  // Handle drag & drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const selectedFile = e.dataTransfer.files[0];
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a valid file before uploading.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("resume", file);


      const baseUrl = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/home/parse`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload file");

      const data = await res.json();
      setSuccess("File uploaded successfully!");
      setResponseData(data); // expecting { name, email, phone }
      console.log(data)
      onUploadSuccess(data.userDetails);
    } catch (err) {
      setError("Failed to upload file. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-50 p-6">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg overflow-hidden">
        <header className="border-b px-6 py-4 flex items-center gap-3">
          <div className="text-blue-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 48 48">
              <path d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold">File Submission Portal</h2>
        </header>

        <main className="p-6">
          <h2 className="text-xl font-bold mb-4">Upload Resume</h2>

          {/* Drag & Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex flex-col items-center gap-4 border-2 border-dashed rounded-lg p-10 cursor-pointer transition ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50"
            }`}
            onClick={() => document.getElementById("fileInput").click()}
          >
            <span className="material-symbols-outlined text-blue-500 text-5xl">
              cloud_upload
            </span>
            <p className="text-gray-700 font-medium text-center">
              Drag & Drop your file here <br /> or Click to Browse
            </p>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
              id="fileInput"
            />
          </div>

          {/* Selected file info */}
          {file && (
            <div className="mt-4 flex items-center justify-between bg-gray-100 p-3 rounded-md shadow-sm">
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-red-500 hover:text-red-700"
              >
                ✖
              </button>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mt-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm">
              {success}
            </div>
          )}


          {/* Upload button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg"
            >
              {loading ? "Uploading..." : "Upload File"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
