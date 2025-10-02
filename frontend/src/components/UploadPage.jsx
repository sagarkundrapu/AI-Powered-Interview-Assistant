import React, { useState } from "react";
import ResumeUpload from "./ResumeUpload";
import ResumeDetails from "./ResumeDetails";

export default function ResumePage({token}) {
  const [resumeData, setResumeData] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {!resumeData ? (
        <ResumeUpload onUploadSuccess={setResumeData} token={token}/>
      ) : (
        <ResumeDetails parsedData={resumeData} token={token}/>
      )}
    </div>
  );
}