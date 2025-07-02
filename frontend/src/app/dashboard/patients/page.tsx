import PatientForm from '@/components/patients/PatientForm';
import PatientList from '@/components/patients/PatientList';

export default function PatientsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Patients Module</h1>
      <PatientForm />
      <PatientList />
    </div>
  );
}
