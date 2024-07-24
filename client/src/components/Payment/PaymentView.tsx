import { useQuery } from '@tanstack/react-query';
import { Home, Loader2, MessageCircleIcon } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getPaymentHistory } from '../../api/payment-history';
import { getPaymentInfo, PaymentInfoResponse } from '../../api/payment-info';
import { useAuthContext } from '../../hooks';
import { Button } from '../ui';
import PaymentHistory from './PaymentHistory';
import PaymentResult from './PaymentResult';

function PaymentView() {
  const { user } = useAuthContext();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [data, setData] = useState<PaymentInfoResponse>();
  const orderCode = searchParams.get('orderCode');

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

  const { data: paymentHistory, refetch } = useQuery({
    queryKey: ['payment-history', user?.email],
    queryFn: () => getPaymentHistory(user?.email),
  });

  if (!data && !paymentHistory) {
    return (
      <span className="flex min-h-80 w-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </span>
    );
  }

  return (
    <div
      className="relative flex w-full grow overflow-hidden bg-white dark:bg-gray-800"
      style={{ paddingBottom: '50px' }}
    >
      <div className="transition-width relative flex h-full w-full flex-1 flex-col items-stretch overflow-hidden bg-white dark:bg-gray-800">
        <div className="mx-auto flex w-full max-w-screen-md flex-col gap-6 p-6 sm:p-8 md:p-10">
          {data && (
            <div className="flex flex-col items-center">
              {data?.status === 'PAID' ? (
                <Fragment>
                  <div className="rounded-full bg-green-500 p-3 text-green-50">
                    <CircleCheckIcon className="h-8 w-8" />
                  </div>
                  <div className="mt-4 text-2xl font-bold">Payment Successful</div>
                  <p className="text-muted-foreground">Your payment was processed successfully.</p>
                </Fragment>
              ) : (
                <Fragment>
                  <div className="rounded-full bg-red-500 p-3 text-green-50">
                    <CircleXIcon className="h-8 w-8" />
                  </div>
                  <div className="mt-4 text-2xl font-bold">Payment Unsuccessful</div>
                  <p className="text-muted-foreground">
                    Please contact admin for more information.
                  </p>
                </Fragment>
              )}
            </div>
          )}
          <div className="flex flex-col gap-6">
            {data && <PaymentResult data={data} />}
            <PaymentHistory data={paymentHistory ?? []} refetch={refetch} />
          </div>
          <div className="flex justify-center">
            <Button size="lg">
              <a href="/" className="flex items-center">
                {data?.status === 'PAID' ? (
                  <>
                    <MessageCircleIcon className="mr-1.5" size={18} />
                    {'Chat now'}
                  </>
                ) : (
                  <>
                    <Home className="mr-1.5" size={18} />
                    {'Return to Home'}
                  </>
                )}
              </a>
            </Button>
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
