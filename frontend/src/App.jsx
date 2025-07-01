import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PatientForm from './components/PatientForm';
import PatientList from './components/PatientList';
import DoctorForm from "./components/DoctorForm";

function App() {
  return (
    <Router>
        <h1 className="text-3xl font-bold underline text-red-600">
    Tailwind is working 🎯
        </h1>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow p-4 flex gap-4">
          <Link to="/" className="text-blue-600 hover:underline">Register</Link>
          <Link to="/patients" className="text-blue-600 hover:underline">View Patients</Link>
          <Link to="/doctors" className="px-4 py-2">Add Doctor</Link>

        </nav>
        <Routes>
          <Route path="/" element={<PatientForm />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/doctors" element={<DoctorForm />} />
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;
