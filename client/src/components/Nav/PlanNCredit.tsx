import { QueryObserverResult } from '@tanstack/react-query';
import { TUserBalanceResponse } from 'librechat-data-provider/dist/types';
import { CreditCard } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
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

const pricings: Pricing[] = [
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
];

const CREDIT_RATE = 0.05;

const PlanNCredit = ({ balanceQuery }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('plan');
  const [selectedPlan, setSelectedPlan] = useState('community');
  const [creditAmount, setCreditAmount] = useState(0);

  if (!balanceQuery?.data) {
    return null;
  }

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
            defaultValue="plan"
            className={cn(
              'max-h-[40rem] w-full transition-all duration-1000',
              activeTab === 'plan' ? 'max-h-[40rem]' : 'max-h-64',
            )}
          >
            <TabsList>
              <TabsTrigger value="plan" onClick={() => setActiveTab('plan')}>
                Manage Plan
              </TabsTrigger>
              <TabsTrigger value="credit" onClick={() => setActiveTab('credit')}>
                Credit
              </TabsTrigger>
            </TabsList>
            <TabsContent className="mt-4 border-none p-0" value="plan">
              <div className="flex flex-col gap-4">
                {pricings.map((pricing) => (
                  <Card
                    key={pricing.id}
                    className={`cursor-pointer py-0 transition-all ${
                      selectedPlan === pricing.id
                        ? 'border-zinc-400 shadow-lg drop-shadow-xl'
                        : 'border-zinc-200 shadow-none drop-shadow-none dark:border-zinc-700'
                    }`}
                    onClick={() => setSelectedPlan(pricing.id)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between py-4">
                      <CardTitle className="text-xl font-semibold">{pricing.title}</CardTitle>
                      <CardDescription className="text-base">
                        {pricing.price}k / month
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4 ">
                      <div>{pricing.shortDescription}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex items-center justify-center pt-6">
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
            <TabsContent className="mt-4 border-none p-0" value="credit">
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
            <Button>Next</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanNCredit;
