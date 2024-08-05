import { QueryObserverResult } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { TUserBalanceResponse } from 'librechat-data-provider/dist/types';
import { CreditCard, ReceiptText, SquareGanttChart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CANCEL_URL, RETURN_URL } from '../../api';
import { createPaymentLink } from '../../api/create-payment-link';
import { useAuthContext } from '../../hooks';
import { cn, generateNumericId } from '../../lib/utils';
import { useToastContext } from '../../Providers';
import CommunityDialog from '../Payment/CommunityDialog';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  Input,
  Label,
  Slider,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { subscribe } from '../../api/subscribe';

type Props = {
  balanceQuery: QueryObserverResult<TUserBalanceResponse>;
};

type Pricing = {
  id: string;
  title: string;
  price: number;
  credits: number;
  shortDescription: string;
};

export const pricings: Pricing[] = [
  {
    id: 'community',
    title: 'Cộng Đồng',
    credits: 150000,
    price: 0,
    shortDescription: 'Dành cho những ai muốn trải nghiệm LoyosAI',
  },
  {
    id: 'standard',
    title: 'Tiêu Chuẩn',
    credits: 1500000,
    price: 69,
    shortDescription: 'Tốt hơn cho cá nhân với lưu lượng sử dụng ít',
  },
  {
    id: 'advanced',
    title: 'Nâng Cao',
    credits: 3500000,
    price: 179,
    shortDescription: 'Dành cho những người dùng nâng cao với nhu cầu vừa',
  },
  {
    id: 'ultimate',
    title: 'Chuyên Nghiệp',
    credits: 5000000,
    price: 249,
    shortDescription: 'Dành cho người dùng nâng cao với nhu cầu lớn và nhiều tính năng bổ sung',
  },
  {
    id: 'credits',
    title: 'Credits',
    credits: 0,
    price: 0,
    shortDescription: '',
  },
];

const CREDIT_RATE = 0.05;

const PlanNCredit = ({ balanceQuery }: Props) => {
  const { user } = useAuthContext();
  const { showToast } = useToastContext();
  const [isOpen, setIsOpen] = useState(false);
  const [communityCode, setCommunityCode] = useState<0 | 1 | 2>(0);
  const [activeTab, setActiveTab] = useState('plan');
  const [selectedPlan, setSelectedPlan] = useState(parseInt(balanceQuery?.data?.plan ?? '0'));
  const [creditAmount, setCreditAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    if (
      user &&
      balanceQuery?.data?.plan === '0' &&
      balanceQuery.data.monthlyTokenCredits === '0' &&
      !isActivated
    ) {
      setIsActivated(true);

      const transId = generateNumericId();
      createPaymentLink({
        orderCode: parseInt(transId),
        plan: 0,
        duration: 0,
        amount: 0,
        cancelUrl: CANCEL_URL,
        returnUrl: RETURN_URL,
        email: user?.email,
      }).then(() => {
        subscribe({
          affectNow: true,
          orderCode: parseInt(transId),
          context: 'subscribe',
          email: user?.email ?? '',
        }).then(() => {
          showToast({
            message: 'Kích hoạt thành viên thành công',
          });
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, balanceQuery?.data?.plan, isActivated]);

  useEffect(() => {
    if (communityCode === 2 && selectedPlan === 0) {
      const transId = generateNumericId();
      setCommunityCode(0);

      createPaymentLink({
        orderCode: parseInt(transId),
        plan: 0,
        duration: 0,
        amount: 0,
        cancelUrl: CANCEL_URL,
        returnUrl: RETURN_URL,
        email: user?.email,
      })
        .then(() => {
          showToast({
            message: 'Gói hiện tại sẽ được huỷ vào ngày cuối của chu kỳ!',
          });
        })
        .catch((error) => {
          console.error('Failed to create payment link:', error);
        })
        .finally(() => setIsLoading(false));
    }
  }, [communityCode, selectedPlan, showToast, user?.email]);

  if (!balanceQuery?.data) {
    return null;
  }

  const handleCreatePaymentLink = async () => {
    setIsLoading(true);
    const transId = generateNumericId();
    if (activeTab === 'plan') {
      if (selectedPlan === 0) {
        setIsLoading(false);
        setCommunityCode(1);
      } else {
        createPaymentLink({
          orderCode: parseInt(transId),
          plan: selectedPlan,
          duration: selectedPlan === 0 ? 0 : 1,
          amount: pricings[selectedPlan].price * 1000,
          cancelUrl: CANCEL_URL,
          returnUrl: RETURN_URL,
          email: user?.email,
        })
          .then((link) => {
            if (link) {
              console.log('Created payment link:', link.checkoutUrl);
              window.location.href = link?.checkoutUrl;
            }
          })
          .catch((error) => {
            console.error('Failed to create payment link:', error);
          })
          .finally(() => setIsLoading(false));
      }
    } else {
      createPaymentLink({
        orderCode: parseInt(transId),
        plan: 4,
        duration: creditAmount,
        amount: creditAmount * CREDIT_RATE,
        cancelUrl: CANCEL_URL,
        returnUrl: RETURN_URL,
        email: user?.email,
        // userId: user?.id,
      })
        .then((link) => {
          if (link) {
            console.log('Created payment link:', link.checkoutUrl);
            window.location.href = link?.checkoutUrl;
          }
        })
        .catch((error) => {
          console.error('Failed to create payment link:', error);
        })
        .finally(() => setIsLoading(false));
    }
  };

  const handleGetButtonLabel = (index: number) => {
    const currentPlan = parseInt(balanceQuery?.data?.plan);
    if (activeTab === 'credit') {
      return 'Mua Credit';
      // return 'Buy Credits';
    } else if (currentPlan === index) {
      return 'Gia hạn';
      // return 'Renew';
    } else if (currentPlan > index) {
      return 'Hạ gói';
      // return 'Downgrade';
    } else {
      return 'Nâng gói';
      // return 'Upgrade';
    }
  };

  return (
    <Dialog onOpenChange={(e) => setIsOpen(e)} open={isOpen}>
      <DialogTrigger asChild>
        <div className="text-token-text-secondary mb-1.5 flex cursor-pointer select-none flex-col gap-3 rounded-md bg-gray-100/50 px-3 py-2.5 text-sm dark:bg-gray-800/50 dark:text-white">
          {/* Credits */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-3">
              <CreditCard className="size-6" />
              Credit
            </span>
            <span>{`${new Intl.NumberFormat().format(
              parseInt(balanceQuery?.data?.balance),
            )}`}</span>
          </div>

          <div className="w-full">
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Progress
                    value={
                      (parseInt(balanceQuery?.data?.remainMonthlyTokenCredits) /
                        parseInt(balanceQuery?.data?.monthlyTokenCredits)) *
                      100
                    }
                    className="h-2 "
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-left font-normal">
                    <div className="mb-2 border-b pb-2">
                      Gói: {pricings[parseInt(balanceQuery?.data?.plan) ?? 0].title}
                    </div>
                    <div>Credit hàng tháng</div>
                    <div>{`${Intl.NumberFormat().format(
                      parseInt(balanceQuery?.data?.remainMonthlyTokenCredits),
                    )} / ${Intl.NumberFormat().format(
                      parseInt(balanceQuery?.data?.monthlyTokenCredits),
                    )}`}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="inline-block h-fit max-h-[80vh] overflow-y-auto px-5 py-6 transition-all dark:text-white sm:max-w-screen-sm lg:max-h-fit lg:p-8">
        <div className="flex h-fit flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold lg:text-2xl">Quản Lý Gói Của Bạn</h3>
            {/* <h3 className="text-lg font-bold lg:text-2xl">Manage Your Plan</h3> */}
          </div>

          <Tabs
            onValueChange={(value) => setActiveTab(value)}
            defaultValue="plan"
            className={cn('w-full border-none outline-none ring-0')}
          >
            <TabsList>
              {/* <TabsTrigger value="plan">Manage Plan</TabsTrigger>
              <TabsTrigger value="credit">Credit</TabsTrigger> */}

              <TabsTrigger value="plan">Gói đăng ký</TabsTrigger>
              <TabsTrigger value="credit">Credit</TabsTrigger>
            </TabsList>
            {/* Plans */}
            <TabsContent className="mt-4 border-none p-0 outline-none ring-0" value="plan">
              <div className="flex flex-col gap-4">
                {pricings.map(
                  (pricing, index) =>
                    index <= 3 && (
                      <Card
                        key={pricing.id}
                        className={`cursor-pointer py-0 transition-all ${
                          selectedPlan === index
                            ? 'border-zinc-400 shadow-lg drop-shadow-xl'
                            : 'border-zinc-200 shadow-none drop-shadow-none dark:border-zinc-700'
                        }`}
                        onClick={() => setSelectedPlan(index)}
                      >
                        <CardHeader className="flex flex-row items-center justify-between py-3 pb-1 lg:py-4 lg:pb-2">
                          <CardTitle className="flex flex-col font-semibold lg:text-xl">
                            <div className="flex items-center">
                              <span>{pricing.title}</span>
                              {balanceQuery?.data?.plan === index.toString() && (
                                <span className="ml-2 rounded-full bg-text-primary px-2.5 py-1 text-xs text-white dark:text-zinc-800">
                                  Gói hiện tại
                                </span>
                              )}
                            </div>
                            {balanceQuery?.data?.plan === index.toString() && index !== 0 && (
                              <div className="mb-2 mt-1 text-xs font-normal opacity-70 lg:text-sm">
                                {`Hết hạn vào : ${dayjs(balanceQuery.data?.expiredAt).format(
                                  'DD/MM/YYYY',
                                )}`}
                              </div>
                            )}
                          </CardTitle>
                          <CardDescription className="pb-2 text-sm lg:text-base">
                            {pricing.price}k / tháng
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-4 max-md:text-xs">
                          <div className="flex items-center gap-1">
                            <CreditCard size={16} />
                            {Intl.NumberFormat().format(pricing.credits)} credit / tháng
                          </div>
                          <div className="mt-1 text-sm opacity-70">{pricing.shortDescription}</div>
                        </CardContent>
                      </Card>
                    ),
                )}
              </div>
              <div className="flex flex-col items-center justify-center gap-4 pt-6 max-md:text-xs">
                <a
                  href="/payment"
                  className="flex items-center underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ReceiptText size={16} className="mr-1" /> Lịch sử thanh toán
                  {/* View payment history */}
                </a>
                <a
                  href="https://loyos.app/pricing"
                  className="flex items-center underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  <SquareGanttChart size={16} className="mr-1" />
                  Chi tiết các gói
                  {/* View pricing details */}
                </a>
              </div>
            </TabsContent>
            {/* Credits */}
            <TabsContent className="mt-4 border-none p-0 outline-none ring-0" value="credit">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="credit-amount">Lượng Credit</Label>
                  <Input
                    id="credit-amount"
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(Number(e.target.value))}
                    className="w-full max-w-[200px]"
                  />
                </div>
                <Slider
                  value={[creditAmount]}
                  onValueChange={(value) => setCreditAmount(value[0])}
                  min={100000}
                  max={100000000}
                  step={100000}
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <span>Tổng chi phí:</span>
                  <span className="text-muted-foreground text-sm">
                    {(creditAmount * CREDIT_RATE).toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <CommunityDialog communityCode={communityCode} setCommunityCode={setCommunityCode} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Huỷ
            </Button>
            {!(activeTab === 'plan' && selectedPlan === 0 && balanceQuery.data.plan === '0') && (
              <Button onClick={() => handleCreatePaymentLink()} loading={isLoading}>
                {handleGetButtonLabel(selectedPlan)}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanNCredit;
