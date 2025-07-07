import RecordForm from "@/components/records/RecordForm";
import RecordList from "@/components/records/RecordList";

export default function RecordsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Medical Records</h1>
      <RecordForm />
      <RecordList />
    </div>
  );
}
