import AppointmentForm from "@/components/appointments/AppointmentForm";
import AppointmentList from "@/components/appointments/AppointmentList";

export default function AppointmentsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Appointments Module</h1>
      <AppointmentForm />
      <AppointmentList />
    </div>
  );
}
