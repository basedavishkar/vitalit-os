import PatientForm from "@/components/patients/PatientForm";
import PatientList from "@/components/patients/PatientList";

export default function Home() {
  return (
    <main className="max-w-xl mx-auto mt-10">
      <PatientForm />
      <PatientList />
    </main>
  );
}
