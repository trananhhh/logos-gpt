import { QueryObserverResult } from '@tanstack/react-query';
import { TUserBalanceResponse } from 'librechat-data-provider/dist/types';
import { CreditCard } from 'lucide-react';
import { useState } from 'react';
import { CANCEL_URL, RETURN_URL } from '../../api';
import { createPaymentLink } from '../../api/create-payment-link';
import { useAuthContext } from '../../hooks';
import { cn, generateNumericId } from '../../lib/utils';
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
import dayjs from 'dayjs';

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
    title: 'Community',
    credits: 100000,
    price: 0,
    shortDescription: 'For those who want to try out LoyosAI',
  },
  {
    id: 'standard',
    title: 'Standard',
    credits: 1500000,
    price: 69,
    shortDescription: 'Better plan for individuals with low usage',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    credits: 3500000,
    price: 179,
    shortDescription: 'Best plan for advanced users',
  },
  {
    id: 'ultimate',
    title: 'Ultimate',
    credits: 5000000,
    price: 249,
    shortDescription: 'Best plan for advanced users with high usage and more features',
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
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('plan');
  const [selectedPlan, setSelectedPlan] = useState(parseInt(balanceQuery?.data?.plan ?? '0'));
  const [creditAmount, setCreditAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  if (!balanceQuery?.data) {
    return null;
  }

  const handleCreatePaymentLink = async () => {
    setIsLoading(true);
    const transId = generateNumericId();

    if (activeTab === 'plan') {
      await createPaymentLink({
        orderCode: parseInt(transId),
        plan: selectedPlan,
        duration: 1,
        amount: pricings[selectedPlan].price * 1000,
        cancelUrl: CANCEL_URL,
        returnUrl: RETURN_URL,
        email: user?.email,
        // userId: user?.id,
      })
        .then((link) => {
          console.log('Created payment link:', link.checkoutUrl);
          window.location.href = link?.checkoutUrl;
        })
        .catch((error) => {
          console.error('Failed to create payment link:', error);
        });
    } else {
      await createPaymentLink({
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
          console.log('Created payment link:', link.checkoutUrl);
          window.location.href = link?.checkoutUrl;
        })
        .catch((error) => {
          console.error('Failed to create payment link:', error);
        });
    }
  };

  const handleGetButtonLabel = (index: number) => {
    const currentPlan = parseInt(balanceQuery?.data?.plan);
    if (activeTab === 'credit') {
      return 'Buy Credits';
    } else if (currentPlan === index) {
      return 'Renew';
    } else if (currentPlan > index) {
      return 'Downgrade';
    } else {
      return 'Upgrade';
    }
  };

  return (
    <Dialog onOpenChange={(e) => setIsOpen(e)} open={isOpen}>
      <DialogTrigger asChild>
        <div className="text-token-text-secondary mb-1.5 flex cursor-pointer select-none flex-col gap-3 rounded-md bg-gray-100/50 px-3 py-2.5 text-sm dark:bg-gray-800/50">
          {/* Credits */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CreditCard size={16} />
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
                      Plan: {pricings[parseInt(balanceQuery?.data?.plan) ?? 0].title}
                    </div>
                    <div>Monthly Credit</div>
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
      <DialogContent className="h-fit px-5 py-6 transition-all dark:text-white sm:max-w-screen-sm lg:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">Manage Your Plan</h3>
          </div>

          <Tabs
            onValueChange={(value) => setActiveTab(value)}
            defaultValue="plan"
            className={cn('max-h-[40rem] w-full border-none outline-none ring-0')}
          >
            <TabsList>
              <TabsTrigger value="plan">Manage Plan</TabsTrigger>
              <TabsTrigger value="credit">Credit</TabsTrigger>
            </TabsList>
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
                        <CardHeader className="flex flex-row items-center justify-between py-4 pb-2">
                          <CardTitle className="flex flex-col text-xl font-semibold">
                            <div className="flex items-center">
                              <span>{pricing.title}</span>
                              {balanceQuery?.data?.plan === index.toString() && (
                                <span className="ml-2 rounded-full bg-text-primary px-2 py-1 text-xs text-white dark:text-zinc-800">
                                  Current
                                </span>
                              )}
                            </div>
                            {balanceQuery?.data?.plan === index.toString() && (
                              <div className="mt-1 text-sm font-normal opacity-70">
                                {`Expired At : ${dayjs(balanceQuery.data?.expiredAt).format(
                                  'DD/MM/YYYY',
                                )}`}
                              </div>
                            )}
                          </CardTitle>
                          <CardDescription className="text-base">
                            {pricing.price}k / month
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-4 ">
                          <div>{pricing.shortDescription}</div>
                        </CardContent>
                      </Card>
                    ),
                )}
              </div>
              <div className="flex flex-col items-center justify-center gap-4 pt-6">
                <a href="/payment" className="underline" target="_blank" rel="noreferrer">
                  View payment history
                </a>
                <a
                  href="https://loyos.app/pricing"
                  className="underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  View pricing details
                </a>
              </div>
            </TabsContent>
            <TabsContent className="mt-4 border-none p-0 outline-none ring-0" value="credit">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="credit-amount">Credit Amount</Label>
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
                  <span>Total cost:</span>
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

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
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
