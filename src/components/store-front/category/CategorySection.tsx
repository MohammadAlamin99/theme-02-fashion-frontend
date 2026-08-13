import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { HiMiniMinusSmall } from "react-icons/hi2";
import { MdChevronRight } from "react-icons/md";
import { CategoryTreeNode } from "@/@types/filter.type";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

interface Props {
  tree: CategoryTreeNode[];
  activeCategoryId: string;
  activePath: Set<string>;
  onUpdate: (key: string, val: string) => void;
}

export default function CategorySection({
  tree,
  activeCategoryId,
  activePath,
  onUpdate,
}: Props) {
  const { language } = useLanguage();
  const t = translations[language];
  return (
    <div className="py-4 border-b border-[#D9D9D9]">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-black md:text-[24px] text-xl font-medium">
          {t.categories}
        </h4>
        <HiMiniMinusSmall className="md:text-2xl text-xl text-gray-400" />
      </div>
      <ul className="flex flex-col gap-4">
        {tree.map((node) => (
          <CategoryItem
            key={node.id}
            node={node}
            level={0}
            activeCategoryId={activeCategoryId}
            activePath={activePath}
            onUpdate={onUpdate}
          />
        ))}
      </ul>
    </div>
  );
}

interface CategoryItemProps {
  node: CategoryTreeNode;
  level: number;
  activeCategoryId: string;
  activePath: Set<string>;
  onUpdate: (key: string, val: string) => void;
}

function CategoryItem({
  node,
  level,
  activeCategoryId,
  activePath,
  onUpdate,
}: CategoryItemProps) {
  const isActive = activeCategoryId === node.id;
  const isBranchOpen = activePath.has(node.id);
  const isRoot = level === 0;

  return (
    <li className="flex flex-col gap-3">
      <div
        onClick={() => onUpdate("category_id", node.id)}
        className="flex justify-between items-center group cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {isRoot ? (
            <IoCheckmarkCircleSharp
              size={24}
              className={isActive ? "text-[#FF7050]" : "text-[#D9D9D9]"}
            />
          ) : (
            <MdChevronRight
              size={24}
              className={
                isActive || isBranchOpen ? "text-[#FF7050]" : "text-gray-400"
              }
            />
          )}
          <span
            className={`transition-colors md:text-[20px] text-base font-normal group-hover:text-black ${
              isRoot
                ? isActive
                  ? "text-[#FF7050] font-medium"
                  : "text-black font-medium"
                : isActive
                  ? "text-[#FF7050]"
                  : "text-[#727272]"
            }`}
          >
            {node.name}
          </span>
        </div>
        <span
          className={`${isActive ? "text-[#FF7050]" : "text-[#727272]"} md:text-[20px] text-base font-normal`}
        >
          {node._count?.products || 0}
        </span>
      </div>

      {(isBranchOpen || activeCategoryId === "") &&
        node.children.length > 0 && (
          <ul className="flex flex-col gap-3 ml-6">
            {node.children.map((child: CategoryTreeNode) => (
              <CategoryItem
                key={child.id}
                node={child}
                level={level + 1}
                activeCategoryId={activeCategoryId}
                activePath={activePath}
                onUpdate={onUpdate}
              />
            ))}
          </ul>
        )}
    </li>
  );
}
