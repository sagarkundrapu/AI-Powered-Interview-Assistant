import React, { use, useEffect, useState } from "react";
import UserDetails from "./UserDetails";

export default function AdminDashboard({ token }) {
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState("Registered Students");
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiResponse, setApiResponse] = useState(null);
  const [stats, setStats] = useState(null);

  const baseUrl =
    import.meta?.env?.VITE_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${baseUrl}/api/dashboard/?pageNumber=1&filter=registered`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError("Failed to fetch stats");
      }
    };

    fetchStats();
  }, []); // ✅ runs only once

  useEffect(() => {
    const fetchFilteredStudents = async () => {
      setLoading(true);
      try {
        const normalizedFilter = (() => {
          switch (filter) {
            case "Attempted":
              return "interviewTaken";
            case "Not Attempted":
              return "interviewNotTaken";
            default:
              return "registered";
          }
        })();

        const res = await fetch(
          `${baseUrl}/api/dashboard/?pageNumber=${page}&filter=${normalizedFilter}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setApiResponse(data);
        setStudents(data.users || []);
      } catch (err) {
        setError("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredStudents();
  }, [page, filter]); 

  const filteredStudents = Array.isArray(apiResponse?.users)
    ? apiResponse.users.filter((s) => {
        if (!search.trim()) return true;
        return (
          s.username?.toLowerCase().includes(search.toLowerCase()) ||
          s._id?.toLowerCase().includes(search.toLowerCase())
        );
      })
    : [];

  const handleRowClick = (student) => {
    setSelectedStudent(student);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-700 dark:text-white">
        Loading student data...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-gray-900 dark:text-white text-2xl sm:text-3xl font-bold mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-6">
          Manage interview details for candidates.
        </p>

        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Registered Students"
            value={stats?.totalMatchedRecords || 0}
          />
          <StatCard
            title="Attempted"
            value={stats?.interviewTakenStudents || 0}
          />
          <StatCard
            title="Not Attempted"
            value={stats?.interviewNotTakenStudents || 0}
          />
        </div>

        {/* --- Filters --- */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search by student name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input w-full rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 h-10 pl-10 pr-4 text-sm"
              />
            </div>

            <div className="relative w-full md:w-auto">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="form-select w-full rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 h-10 pl-3 pr-10 text-sm"
              >
                <option>Registered Students</option>
                <option>Attempted</option>
                <option>Not Attempted</option>
              </select>
            </div>
          </div>

          {/* --- Table --- */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <Th>Student ID</Th>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Score</Th>
                  <Th center>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStudents.map((s) => (
                    <tr
                      key={s._id}
                      onClick={() => handleRowClick(s)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/20 cursor-pointer"
                    >
                      <Td>{s._id}</Td>
                      <Td>{s.username}</Td>
                      <Td>{s.email}</Td>
                      <Td>{s.interviewScore ?? "-"}</Td>
                      <Td center>
                        <span
                          className={`text-xl ${
                            s.interviewTaken ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {s.interviewTaken ? "✔️" : "❌"}
                        </span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>

          {/* --- Pagination --- */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-800 dark:text-white">
                {(apiResponse?.currentPage - 1) * apiResponse?.recordsPerPage +
                  1}
                -
                {Math.min(
                  apiResponse?.currentPage * apiResponse?.recordsPerPage,
                  apiResponse?.totalMatchedRecords
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800 dark:text-white">
                {apiResponse?.totalMatchedRecords}
              </span>
            </p>

            <nav className="flex items-center gap-2">
              <button
                disabled={apiResponse?.currentPage === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="px-3 h-8 text-white text-sm border rounded-lg disabled:opacity-100 cursor-pointer"
              >
                Previous
              </button>

              {Array.from({ length: apiResponse?.totalPages || 0 }).map(
                (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 text-white text-sm rounded-lg border ${
                      apiResponse?.currentPage === i + 1
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              )}

              <button
                disabled={apiResponse?.currentPage === apiResponse?.totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-3 h-8 text-white text-sm border rounded-lg disabled:opacity-100 cursor-pointer"
              >
                Next
              </button>
            </nav>
          </div>
        </div>

        {/* --- Student Detail & Chat --- */}
        {selectedStudent && (
          <UserDetails
            studentId={selectedStudent._id}
            onClose={() => setSelectedStudent(null)}
            token={token}
            />)}
      </div>
    </div>
  );
}

const StatCard = ({ title, value }) => (
  <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
      {title}
    </p>
    <p className="text-gray-900 dark:text-white text-3xl font-bold">{value}</p>
  </div>
);

const Th = ({ children, center }) => (
  <th
    className={`px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
      center ? "text-center" : ""
    }`}
  >
    {children}
  </th>
);

const Td = ({ children, center }) => (
  <td
    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 ${
      center ? "text-center" : ""
    }`}
  >
    {children}
  </td>
);
