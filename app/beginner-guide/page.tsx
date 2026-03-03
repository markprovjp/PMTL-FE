import { getBeginnerGuides, getBeginnerGuideFiles } from "@/lib/api/guides";
import BeginnerGuideClient from "./BeginnerGuideClient";

export const metadata = {
  title: "Hướng Dẫn Sơ Học | Pháp Môn Tâm Linh",
  description: "Lộ trình 6 bước để bắt đầu tu học Pháp Môn Tâm Linh. Tất cả tài liệu đều miễn phí tuyệt đối.",
};

export default async function BeginnerGuidePage() {
  // Fetch song song cả 2 nguồn dữ liệu
  const [guides, guideFiles] = await Promise.all([
    getBeginnerGuides(),
    getBeginnerGuideFiles(),
  ]);
  return <BeginnerGuideClient initialGuides={guides} initialGuideFiles={guideFiles} />;
}
