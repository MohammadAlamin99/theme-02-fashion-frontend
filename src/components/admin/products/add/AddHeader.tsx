import EditFileIcon from "@/components/store-front/svg/svg/EditFileIcon";
import { Plus } from "lucide-react";
import PrimaryButton from "../../common/PrimaryButton";

export default function AddHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-2 p-4">
      <h1 className="text-xl font-bold text-black sm:text-2xl">
        Product Upload
      </h1>
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <button className="flex items-center gap-2 px-6 py-3.5 rounded-[8px] bg-white text-[#070606] font-semibold text-sm justify-center w-full sm:w-[171px] border border-gray-100 shadow-sm md:shadow-none">
          <EditFileIcon /> Draft
        </button>

        <PrimaryButton
          icon={
            <Plus
              size={24}
              className="border-2 border-white rounded-full p-0.5"
            />
          }
          label="Add Product"
          className="w-full sm:w-auto justify-center"
        />
      </div>
    </div>
  );
}
