import { useQuery } from '@tanstack/react-query';
import { useGetStartupConfig, useGetUserBalance } from 'librechat-data-provider/react-query';
import { ArrowLeft, Loader2, MessageCircleIcon } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getPaymentHistory } from '../../api/payment-history';
import { getPaymentInfo, PaymentInfoResponse } from '../../api/payment-info';
import { subscribe } from '../../api/subscribe';
import { useAuthContext } from '../../hooks';
import { getSubscribeContext } from '../../lib/utils';
import { useToastContext } from '../../Providers';
import { Button } from '../ui';
import PaymentHistory, { SubscribeParams } from './PaymentHistory';
import PaymentResult from './PaymentResult';
import SubscribeDialog from './SubscribeDialog';

function PaymentView() {
  const { user } = useAuthContext();
  const { isAuthenticated } = useAuthContext();
  const { data: startupConfig } = useGetStartupConfig();
  const balanceQuery = useGetUserBalance({
    enabled: !!isAuthenticated && startupConfig?.checkBalance,
  });
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [data, setData] = useState<PaymentInfoResponse>();
  const orderCode = searchParams.get('orderCode');
  const [dialogCode, setDialogCode] = useState<SubscribeParams | undefined>();
  const { showToast } = useToastContext();

  useEffect(() => {
    if (!orderCode) {
      return;
    }
    getPaymentInfo(orderCode)
      .then((result) => {
        setData(result);
      })
      .catch((error) => console.error('Error fetching payment request:', error));
  }, [orderCode]);

  const {
    data: paymentHistory,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['payment-history', user?.email],
    queryFn: () => getPaymentHistory(user?.email),
  });

  useEffect(() => {
    if (orderCode && paymentHistory) {
      const currentItem = paymentHistory.find((item) => item.orderCode === parseInt(orderCode));
      if (!currentItem?.handled && currentItem?.status === 'success') {
        if (
          currentItem?.plan === 4 ||
          balanceQuery?.data?.plan ||
          balanceQuery?.data?.plan === '0'
        ) {
          handleSubscribe(currentItem.orderCode);
        } else {
          setDialogCode({
            orderCode: currentItem.orderCode.toString(),
            context: getSubscribeContext(
              balanceQuery.data?.plan ?? '0',
              currentItem.plan.toString(),
            ),
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentHistory, orderCode]);

  if (isLoading) {
    return (
      <span className="flex min-h-80 w-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </span>
    );
  }

  const handleSubscribe = async (orderCode: number, context?: string) => {
    subscribe({
      affectNow: true,
      orderCode,
      email: user?.email,
      context,
    }).then((result) => {
      setDialogCode(undefined);
      refetch();
      showToast({
        status: 'info',
        message: result.message,
      });
    });
  };

  return (
    <div
      className="relative flex w-full grow overflow-hidden bg-white dark:bg-gray-800"
      style={{ paddingBottom: '50px' }}
    >
      <SubscribeDialog
        dialogCode={dialogCode}
        setDialogCode={setDialogCode}
        handleSubscribe={handleSubscribe}
      />
      <div className="transition-width relative flex h-full w-full flex-1 flex-col items-stretch overflow-hidden bg-white dark:bg-gray-800 dark:text-white">
        <div className="mx-auto flex w-full max-w-screen-lg flex-col gap-6 p-6 sm:p-8 md:p-10">
          <div className="flex justify-between">
            <Button variant="link" className="px-0 font-normal">
              <a href="/" className="flex items-center">
                <ArrowLeft className="mr-1.5" size={16} />
                {'Quay lại Trang chủ'}
                {/* {'Return to Home'} */}
              </a>
            </Button>

            <Button variant="outline" className="font-normal">
              <a href="/" className="flex items-center">
                <MessageCircleIcon className="mr-1.5" size={18} />
                {'Chat ngay'}
              </a>
            </Button>
          </div>

          {data && (
            <div className="flex flex-col items-center">
              {data?.status === 'PAID' ? (
                <Fragment>
                  <div className="rounded-full bg-green-500 p-3 text-green-50">
                    <CircleCheckIcon className="h-8 w-8" />
                  </div>
                  <div className="mt-4 text-2xl font-bold">Thanh toán thành công!</div>
                  {/* <div className="mt-4 text-2xl font-bold">Payment Successful</div> */}
                  <p className="text-muted-foreground">
                    Giao dịch của bạn đã được xử lí thành công.
                  </p>
                  {/* <p className="text-muted-foreground">Your payment was processed successfully.</p> */}
                </Fragment>
              ) : (
                <Fragment>
                  <div className="rounded-full bg-red-500 p-3 text-green-50">
                    <CircleXIcon className="h-8 w-8" />
                  </div>
                  <div className="mt-4 text-2xl font-bold">Thanh toán thất bại!</div>
                  {/* <div className="mt-4 text-2xl font-bold">Payment Unsuccessful</div> */}
                  <p className="text-muted-foreground">
                    Vui lòng liên hệ quản trị viên để biết thêm thông tin.
                    {/* Please contact admin for more information. */}
                  </p>
                </Fragment>
              )}
            </div>
          )}
          <div className="flex flex-col gap-6">
            {data && <PaymentResult data={data} />}
            <PaymentHistory
              data={paymentHistory ?? []}
              setDialogCode={setDialogCode}
              currentPlan={balanceQuery?.data?.plan ?? '0'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CircleCheckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function CircleXIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}

export default PaymentView;
