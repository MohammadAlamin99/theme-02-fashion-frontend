import PermissionGuard from "@/components/admin/common/PermissionGuard";
import OrderHeader from "@/components/admin/order/OrderHeader";
import OrderTable from "@/components/admin/order/OrderTable";

export default function Page() {
  return (
    <PermissionGuard permission="Orders">
      <div className="flex">
        <main className="flex-1">
          <div className="p-2 md:p-0">
            <div className="mt-2">
              <OrderHeader />
            </div>
            {/* <OrderSummery /> */}
            <OrderTable />
          </div>
        </main>
      </div>
    </PermissionGuard>
  );
}
