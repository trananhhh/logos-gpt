import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Check } from 'lucide-react';
import { PaymentHistoryResponse } from '../../api/payment-history';
import { subscribe } from '../../api/subscribe';
import { useAuthContext } from '../../hooks';
import { cn } from '../../lib/utils';
import { useToastContext } from '../../Providers';
import { pricings } from '../Nav/PlanNCredit';
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const PaymentHistory = ({
  data,
  refetch,
}: {
  data: PaymentHistoryResponse[];
  refetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined,
  ) => Promise<QueryObserverResult<PaymentHistoryResponse[], unknown>>;
}) => {
  const { user } = useAuthContext();
  const { showToast } = useToastContext();

  const handleSubscribe = async (orderCode: number) => {
    subscribe({
      affectNow: true,
      orderCode,
      email: user?.email,
    }).then((result) => {
      refetch();
      showToast({
        status: 'info',
        message: result.message,
      });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent className="w-full max-w-full overflow-x-auto max-md:w-fit">
        <Table className="whitespace-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead>Order Code</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.length === 0 && <div>Payment History Empty!</div>}
            {data?.length > 0 &&
              data
                ?.sort((a, b) => (dayjs(a?.createAt).isAfter(b?.createAt) ? -1 : 1))
                .map((item) => (
                  <TableRow key={item?._id} className="h-14 items-center">
                    <TableCell>{`${item?.orderCode}`}</TableCell>
                    <TableCell>
                      {dayjs(item?.createAt).add(7, 'hours').format('DD/MM/YYYY HH:mm')}
                    </TableCell>
                    <TableCell>
                      {item?.duration
                        ? `${item?.duration} month`
                        : `${Intl.NumberFormat().format(item?.tokenCredits ?? 0)}`}
                    </TableCell>
                    <TableCell>{pricings[item?.plan]?.title}</TableCell>
                    <TableCell>
                      {item?.amount?.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex h-full min-w-20 items-center justify-center">
                        {!(item?.status === 'success' && !item?.handled) ? (
                          <span
                            className={cn(
                              'rounded-md border px-2 py-1 text-center',
                              item?.status === 'success' &&
                                'border-green-500 bg-green-50 text-green-500',
                              item?.status === 'pending' &&
                                'border-orange-500 bg-orange-50 text-orange-500',
                              item?.status === 'canceled' &&
                                'border-red-500 bg-red-50 text-red-500',
                            )}
                          >
                            {item?.status?.toUpperCase()}
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            className="h-8 border-blue-400 font-medium text-blue-400"
                            variant="outline"
                            onClick={() => handleSubscribe(item?.orderCode)}
                          >
                            <Check size={15} className="mr-1" />
                            Apply Now
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
