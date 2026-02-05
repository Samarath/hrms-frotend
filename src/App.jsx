import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", department: "" });

  const refreshData = () => {
    axios
      .get(`${API_URL}/employees`)
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error(err));

    axios
      .get(`${API_URL}/attendance`)
      .then((res) => setAttendance(res.data.reverse()))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await axios.get(`${API_URL}/employees`);
        setEmployees(empRes.data);

        const attRes = await axios.get(`${API_URL}/attendance`);
        setAttendance(attRes.data.reverse());
      } catch (error) {
        console.error("Error connecting to backend:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.department) return;
    try {
      await axios.post(`${API_URL}/employees`, form);
      setForm({ name: "", email: "", department: "" });
      refreshData();
    } catch (error) {
      alert("Error adding employee", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_URL}/employees/${id}`);
      refreshData();
    } catch (error) {
      alert("Error deleting employee", error);
    }
  };

  const handleMarkAttendance = async (employeeId, status) => {
    const today = new Date().toISOString().split("T")[0];
    try {
      await axios.post(`${API_URL}/attendance`, {
        employee_id: employeeId,
        date: today,
        status: status,
      });
      alert(`Marked ${status}!`);
      refreshData();
    } catch (error) {
      alert("Attendance already marked today.", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">HRMS Lite</h1>
          <p className="text-gray-500">Employee & Attendance Management</p>
          {/* Debug: Show current connected API */}
          <p className="text-xs text-gray-400 mt-2">Connected to: {API_URL}</p>
        </div>

        {/* Form: Add Employee */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add New Employee</h2>
          <form
            onSubmit={handleAddEmployee}
            className="flex flex-col md:flex-row gap-4"
          >
            <input
              className="border p-2 rounded w-full"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="border p-2 rounded w-full"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="border p-2 rounded w-full"
              placeholder="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold">
              Add
            </button>
          </form>
        </div>

        {/* Table: Employee List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Employee Directory</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3">Name</th>
                  <th className="p-3">Dept</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{emp.name}</div>
                      <div className="text-xs text-gray-400">{emp.email}</div>
                    </td>
                    <td className="p-3">{emp.department}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleMarkAttendance(emp.id, "Present")}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200"
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleMarkAttendance(emp.id, "Absent")}
                        className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm hover:bg-yellow-200"
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan="3" className="p-4 text-center text-gray-400">
                      Loading or No Data...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* List: Attendance Logs */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Attendance Log</h2>
          <ul className="space-y-2">
            {attendance.slice(0, 5).map((record) => {
              const emp = employees.find((e) => e.id === record.employee_id);
              return (
                <li
                  key={record.id}
                  className="flex justify-between p-2 border-b bg-gray-50 rounded"
                >
                  <span>
                    {emp ? emp.name : "Unknown User"}
                    <span className="text-gray-400 text-sm ml-2">
                      ({record.date})
                    </span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-sm font-bold ${record.status === "Present" ? "text-green-600" : "text-red-600"}`}
                  >
                    {record.status}
                  </span>
                </li>
              );
            })}
            {attendance.length === 0 && (
              <p className="text-gray-400">No attendance marked yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
