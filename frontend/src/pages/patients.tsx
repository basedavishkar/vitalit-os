import DashboardLayout from "@/layouts/DashboardLayout";
import PatientList from "@/components/patients/PatientList";
import AddPatientForm from "@/components/patients/AddPatientForm";

const PatientsPage = () => {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Patients</h1>
      <AddPatientForm />
      <PatientList />
    </DashboardLayout>
  );
};

export default PatientsPage;
