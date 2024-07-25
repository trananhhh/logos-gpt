import { ShieldCheck } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Button } from '../ui';
import { Dialog, DialogContent, DialogFooter } from '../ui/Dialog';

type Props = {
  dialogCode?: string;
  setDialogCode: Dispatch<SetStateAction<string | undefined>>;
  handleSubscribe: (orderCode: number) => Promise<void>;
};

const SubscribeDialog = ({ dialogCode, setDialogCode, handleSubscribe }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleActivate = async () => {
    setIsLoading(true);
    await handleSubscribe(parseInt(dialogCode ?? ''));
  };

  useEffect(() => {
    setIsLoading(false);
  }, [dialogCode]);

  return (
    <Dialog onOpenChange={() => setDialogCode('')} open={!!dialogCode && dialogCode !== ''}>
      <DialogContent className="h-fit px-5 py-6 transition-all dark:text-white sm:max-w-screen-sm lg:p-8">
        <div className="-mt-2">
          <h3 className="flex items-center gap-1 text-lg font-bold">
            <ShieldCheck size={18} />
            Kích hoạt gói mới
          </h3>
          <p className="mt-4 font-light">
            Gói đăng ký mới của bạn sẽ có hiệu lực ngay lập tức, chu kỳ 30 ngày / tháng sẽ áp dụng
            từ ngày hôm nay, toàn hộ số dư Credit hàng tháng (Monthly Credit) của bạn sẽ được chuyển
            vào số dư Credit không kỳ hạn.
            <br />
            <br />
            Nếu bạn chọn Không áp dụng ngay, gói mới này sẽ được kích hoạt tự động ngay khi gói hiện
            tại kết thúc.
          </p>
        </div>
        <DialogFooter className="justify-end p-0">
          <Button variant="ghost" onClick={() => setDialogCode('')}>
            Để sau
          </Button>
          <Button onClick={() => handleActivate()} loading={isLoading}>
            Kích hoạt ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscribeDialog;
