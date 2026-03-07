'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info } from 'lucide-react';

export function ChantingGuidelinesDialog() {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Info className="w-4 h-4" />
          <span className="hidden sm:inline">Hướng dẫn niệm kinh</span>
          <span className="sm:hidden">Hướng dẫn</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0 w-[calc(100vw-1rem)] sm:rounded-2xl">
        <AlertDialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <AlertDialogTitle>Hướng dẫn niệm kinh</AlertDialogTitle>
          <AlertDialogDescription>
            Đọc các hướng dẫn quan trọng để niệm kinh hiệu quả
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar touch-pan-y"
          data-lenis-prevent
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <Tabs defaultValue="start" className="w-full px-6 py-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="start">Bắt đầu</TabsTrigger>
              <TabsTrigger value="notes">Lưu ý quan trọng</TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <TabsContent value="start" className="space-y-4 mt-0">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Thời gian niệm kinh</h3>
                    <p className="text-sm text-muted-foreground">
                      Từ 5 giờ sáng đến 12 giờ khuya. Không nên ngồi dập chân (không nên ngồi thiền) trong quá trình niệm kinh.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm mb-2">Thời gian tốt nhất cho các bài kinh</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>
                        <strong>"Bát Nhã Ba La Mật Đa Tâm Kinh" và "Vãng Sinh Tịnh Độ Thần Chú":</strong> Nên tụng trước 10 giờ tối và vào ban ngày khi trời mưa âm u vẫn có thể tụng niệm.
                      </li>
                      <li>
                        <strong>"Lễ Phật Đại Sám Hối Văn":</strong> Thông thường từ 10 giờ đêm đến 5 giờ sáng không nên tụng niệm.
                      </li>
                      <li>
                        <strong>Tránh niệm bất kỳ kinh văn nào:</strong> Từ 2-5 giờ sáng.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm mb-2">Thời tiết khắc nghiệt</h3>
                    <p className="text-sm text-muted-foreground">
                      Nếu gặp thời tiết mưa gió sấm sét khắc nghiệt, tốt nhất đừng nên tụng niệm.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm mb-2">Khi cơ thể suy yếu</h3>
                    <p className="text-sm text-muted-foreground">
                      Nếu cơ thể suy yếu và niệm kinh cảm thấy khó chịu, tốt nhất nên niệm vào ban ngày.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4 mt-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Trường hợp đặc biệt (Bệnh nặng, phẫu thuật, ung thư)</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Nếu như trong trường hợp phải đối mặt những giây phút quan trọng, trước và sau phẫu thuật, bị bệnh nặng, hoặc ung thư...
                    </p>
                    <div className="bg-muted p-3 rounded-md space-y-2">
                      <p className="text-sm">
                        <strong>Khuyến nghị:</strong> Mỗi ngày nỗ lực tụng niệm <strong>Chú Đại Bi 21 biến, 49 biến hoặc càng nhiều càng tốt.</strong>
                      </p>
                      <p className="text-sm">
                        <strong>Cầu nguyện trước khi tụng:</strong> "Xin Nam Mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn Quảng Đại Linh Cảm Quán Thế Âm Bồ Tát chữa bệnh (một bộ phận nào đó trên cơ thể bị bệnh) của con, con tên (tên mình) sớm ngày hồi phục."
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm mb-2">Khi bị gián đoạn trong quá trình niệm kinh</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>
                        <strong>Bài kinh ngắn:</strong> Nên đọc lại từ đầu.
                      </li>
                      <li>
                        <strong>Bài kinh dài:</strong> Khi bị gián đoạn giữa chừng, có thể niệm "Ong lai mu so ho", sau đó hoàn thành công việc, rồi niệm lại "Ong lai mu so ho" và tiếp tục niệm phần còn lại.
                      </li>
                      <li>
                        <strong>Lưu ý:</strong> Thời gian gián đoạn không nên quá 1 giờ.
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-card shrink-0">
          <AlertDialogCancel className="h-10">Đóng</AlertDialogCancel>
          <AlertDialogAction onClick={() => setOpen(false)} className="h-10 bg-gold hover:bg-gold/90 text-black font-semibold">
            Tôi đã hiểu
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
