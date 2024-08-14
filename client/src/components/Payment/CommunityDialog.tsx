import { ShieldMinus } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { Button } from '../ui';
import { Dialog, DialogContent, DialogFooter } from '../ui/Dialog';

type Props = {
  communityCode: 0 | 1 | 2;
  setCommunityCode: Dispatch<SetStateAction<0 | 1 | 2>>;
};

const CommunityDialog = ({ communityCode, setCommunityCode }: Props) => {
  return (
    <Dialog open={communityCode === 1} onOpenChange={(e) => setCommunityCode(e ? 1 : 0)}>
      <DialogContent className="h-fit px-5 py-6 transition-all dark:text-white sm:max-w-screen-sm lg:p-8">
        <div className="-mt-2">
          <h3 className="flex items-center gap-1 text-lg font-bold">
            <ShieldMinus size={18} />
            Huỷ gói trả phí
          </h3>
          <p className="mt-4 font-light">
            Gói trả phí sẽ được huỷ vào ngày cuối cùng của gói hiện tại.
            <br />
            <br />
            Sau khi huỷ, các tính năng Nâng cao sẽ không thể sử dụng, những mô hình Tier 1 (miễn phí
            đối với các gói trả phí) sẽ tính theo lưu lượng sử dụng của bạn.
          </p>
        </div>
        <DialogFooter className="justify-end p-0">
          <Button variant="ghost" onClick={() => setCommunityCode(0)}>
            Để tôi suy nghĩ lại
          </Button>
          {/* <a href={`/payment?orderCode=${communityCode}`}> */}
          <Button onClick={() => setCommunityCode(2)}>Đồng ý Huỷ</Button>
          {/* </a> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityDialog;
