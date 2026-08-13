import { SectionWrapper } from "./SectionWrapper";
import { Label } from "./Label";
import { Input } from "./Input";

export default function SeoSection() {
  return (
    <SectionWrapper title="SEO Meta Search Info">
      <div className="space-y-4">
        <div>
          <Label>Meta Search Keywords</Label>
          <Input placeholder="samsung, refrigerator, 525 litre, home appliance" />
        </div>
        <div>
          <Label>SEO Meta Title</Label>
          <Input placeholder="Samsung 525 Litre Refrigerator - Best Price" />
        </div>
        <div>
          <Label>SEO Meta Description Layout</Label>
          <Input placeholder="Buy original Samsung 525 Litre Refrigerator at the best price..." />
        </div>
      </div>
    </SectionWrapper>
  );
}
