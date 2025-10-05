import { useEffect, useState } from "react";

export default function UserDetails({ studentId, onClose, token }) {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const baseUrl =
    import.meta?.env?.VITE_API_BASE_URL || "http://localhost:3000";
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/dashboard/summary/${studentId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" , Authorization: `Bearer ${token}`},
        });
        const data = await res.json();
        console.log(data)
        setStudentData(data);
      } catch (err) {
        console.error("Failed to fetch interview data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [studentId]);

  if (loading) return <div className="p-6">Loading interview...</div>;

  if (!studentData) return <div className="p-6">No data found.</div>;

  const { username, email, phone, interviewScore, interview, interviewTaken} = studentData.user;
  console.log(interviewTaken)

  return (
    <div className="relative bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-6">
      {/* ❌ Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-xl text-gray-500 hover:text-red-500"
      >
        ❌
      </button>

      {/* Profile Info */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          {username}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          ID: {studentId}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Email: {email}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Phone: {phone}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Interview Status: {interviewTaken ? "Completed" : "Not Taken"}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Score: {interviewTaken ? interviewScore : "-"}/100
        </p>
      </div>

      {/* Interview Chat */}
      <div className="space-y-4">
        {interview.map((entry, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
          >
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
             <span>{index}</span>) <br /> <u><strong>Interviewer:</strong></u><br /> {entry.question}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              <u><strong>{username}:</strong></u> <br /> {entry.answer}
            </p>
            <p className="text-xs text-right text-green-600 dark:text-green-400 mt-1">
              Timetaken: {entry.timeTaken} sec
            </p>
            <p className="text-xs text-right text-green-600 dark:text-green-400 mt-1">
              Marks: {entry.correctness}/10
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
