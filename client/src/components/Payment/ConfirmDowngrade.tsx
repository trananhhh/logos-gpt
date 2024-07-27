import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui';
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from '../ui/Dialog';

const ConfirmDowngrade = () => {
  const [isOpen, setIsOpen] = useState(false);
  //   const { user } = useAuthContext();
  //   const { showToast } = useToastContext();
  //   const [isLoading, setIsLoading] = useState(false);

  //   const handleSubscribe = async (orderCode: number) => {
  //     setIsLoading(true);

  //     subscribe({
  //       affectNow: true,
  //       orderCode,
  //       email: user?.email,
  //     }).then((result) => {
  //       showToast({
  //         status: 'info',
  //         message: result.message,
  //       });
  //     });
  //   };

  return (
    <Dialog onOpenChange={(e) => setIsOpen(e)} open={isOpen}>
      <DialogTrigger asChild>
        <Button>Downgrade</Button>
      </DialogTrigger>

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
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Để sau
          </Button>
          {/* <Button onClick={() => handleSubscribe()} loading={isLoading}>
            Kích hoạt ngay
          </Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDowngrade;
