import { SectionWrapper } from "./SectionWrapper";
import { Label } from "./Label";
import { Input } from "./Input";

export default function SeoSection() {
  return (
    <SectionWrapper title="SEO Info">
      <div className="space-y-4">
        <div>
          <Label>Meta Title</Label>
          <Input placeholder="Required for Google ranking" />
        </div>
        <div>
          <Label>Meta Tags</Label>
          <Input placeholder="Required for Google ranking" />
        </div>
        <div>
          <Label>Meta description</Label>
          <Input placeholder="Required for Google ranking" />
        </div>
      </div>
    </SectionWrapper>
  );
}
