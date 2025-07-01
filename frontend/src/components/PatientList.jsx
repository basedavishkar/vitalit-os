import { useEffect, useState } from 'react';
import axios from 'axios';

const PatientList = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/patients')
      .then((res) => setPatients(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Patient List</h2>
      <ul className="space-y-2">
        {patients.map((p) => (
          <li key={p.id} className="border p-2 rounded bg-gray-50 shadow-sm">
            <strong>{p.name}</strong> — Age: {p.age}, Gender: {p.gender}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatientList;
