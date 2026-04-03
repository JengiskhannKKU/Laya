import MobileLayout from "@/components/layout/MobileLayout";
import TryOnContainer from "@/components/tryon/TryOnContainer";

export const metadata = {
  title: "Virtual Try-On | LAYA",
  description: "Try on Thai textile products in AR using your webcam.",
};

export default function TryOnPage() {
  return (
    <MobileLayout>
      <TryOnContainer />
    </MobileLayout>
  );
}
