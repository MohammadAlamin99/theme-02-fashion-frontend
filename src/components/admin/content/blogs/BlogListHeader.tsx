import React from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import PrimaryButton from "../../common/PrimaryButton";

interface Props {
  selectedCount: number;
  onBulkDelete: () => void;
  onCreateClick: () => void;
}

export default function BlogListHeader({
  selectedCount,
  onBulkDelete,
  onCreateClick,
}: Props) {
  return (
    <div className="p-6 flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-lato">Blog</h1>
        <p className="text-gray-400 text-sm font-poppins">
          Create unlimited Blog
        </p>
      </div>
      <div className="flex gap-4">
        {selectedCount > 0 && (
          <button
            onClick={onBulkDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm cursor-pointer font-poppins font-medium"
          >
            <Trash2 size={18} /> Bulk Delete
          </button>
        )}
        <PrimaryButton
          label="Create Blog"
          icon={<PlusCircle size={20} />}
          onClick={onCreateClick}
        />
      </div>
    </div>
  );
}
