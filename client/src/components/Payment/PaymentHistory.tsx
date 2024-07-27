import dayjs from 'dayjs';
import { Calendar, Check, ReceiptText } from 'lucide-react';
import { Dispatch } from 'react';
import { PaymentHistoryResponse } from '../../api/payment-history';
import { cn } from '../../lib/utils';
import { pricings } from '../Nav/PlanNCredit';
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const PaymentHistory = ({
  data,
  setDialogCode,
}: {
  data: PaymentHistoryResponse[];
  setDialogCode: Dispatch<React.SetStateAction<string | undefined>>;
}) => {
  const handleSubscribe = async (orderCode: number) => {
    setDialogCode(orderCode.toString());
  };

  return (
    <Card className="dark:text-white">
      <CardHeader>
        <CardTitle>Lịch sử thanh toán</CardTitle>
        {/* <CardTitle>Payment History</CardTitle> */}
      </CardHeader>
      <CardContent className="w-full max-w-full overflow-x-auto max-md:w-fit">
        <Table className="whitespace-nowrap ">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-0">Mã đơn hàng</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="text-right">Chi tiết</TableHead>
              <TableHead className="text-right">Gói</TableHead>
              <TableHead className="text-right">Số tiền</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>

              {/* <TableHead>Order Code</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {data?.length > 0 &&
              data
                ?.sort((a, b) => (dayjs(a?.createAt).isAfter(b?.createAt) ? -1 : 1))
                .map((item) => (
                  <TableRow key={item?._id} className="h-14 items-center">
                    <TableCell className="pl-0">
                      <div className="flex h-full min-w-20 items-center">
                        <ReceiptText size={16} className="mr-1" />
                        {`${item?.orderCode}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      {' '}
                      <div className="flex h-full min-w-20 items-center">
                        <Calendar size={16} className="mr-1" />
                        {dayjs(item?.createAt).add(7, 'hours').format('DD/MM/YYYY HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {item?.duration
                        ? `${item?.duration} tháng`
                        : `${Intl.NumberFormat().format(item?.tokenCredits ?? 0)}`}
                    </TableCell>
                    <TableCell className="text-right">{pricings[item?.plan]?.title}</TableCell>
                    <TableCell className="text-right">
                      {item?.amount?.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex h-full min-w-20 items-center justify-center text-xs">
                        {!(item?.status === 'success' && !item?.handled) ? (
                          <span
                            className={cn(
                              'rounded-md border px-2 py-1 text-center',
                              item?.status === 'success' &&
                                'border-green-500 bg-green-50 text-green-500',
                              item?.status === 'pending' &&
                                'border-orange-500 bg-orange-50 text-orange-500',
                              item?.status === 'cancelled' &&
                                'border-red-500 bg-red-50 text-red-500',
                            )}
                          >
                            {item?.status?.toUpperCase()}
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            className="h-7 border-blue-400 text-xs font-medium text-blue-600 dark:bg-blue-600"
                            variant="outline"
                            onClick={() => handleSubscribe(item?.orderCode)}
                          >
                            <Check size={15} className="mr-1" />
                            Kích hoạt
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        {data?.length === 0 && (
          <p className="w-full flex-1 py-4 text-center text-sm">Lịch sử giao dịch trống!</p>
          // <p className="w-full flex-1 py-4 text-center text-sm">Payment History Empty!</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
