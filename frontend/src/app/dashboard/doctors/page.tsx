import DoctorForm from "@/components/doctors/DoctorForm";
import DoctorList from "@/components/doctors/DoctorList";

export default function DoctorsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Doctors Module</h1>
      <DoctorForm />
      <DoctorList />
    </div>
  );
}
