import BillForm from "@/components/bills/BillForm";
import BillList from "@/components/bills/BillList";

export default function BillingPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Billing</h1>
      <BillForm />
      <BillList />
    </div>
  );
}
