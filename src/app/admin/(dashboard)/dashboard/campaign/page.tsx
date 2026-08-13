import CampaignTable from "@/components/admin/campaign/CampaignTable";
import PermissionGuard from "@/components/admin/common/PermissionGuard";

export default function Page() {
  return (
    <PermissionGuard permission="Campaign">
      <div className="flex overflow-hidden">
        <main className="w-full mt-4">
          <CampaignTable />
        </main>
      </div>
    </PermissionGuard>
  );
}
