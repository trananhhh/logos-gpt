import dayjs from 'dayjs';
import { PaymentInfoResponse } from '../../api/payment-info';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import PaymentItem from './PaymentItem';

const PaymentResult = ({ data }: { data?: PaymentInfoResponse }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <PaymentItem label={'Order Code'} content={data?.orderCode.toString()} />

        <PaymentItem
          label={'Amount'}
          content={data?.amount.toLocaleString('it-IT', {
            style: 'currency',
            currency: 'vnd',
          })}
        />

        <PaymentItem label={'Time'} content={dayjs(data?.createdAt).format('HH:mm DD/MM/YYYY')} />
      </CardContent>
    </Card>
  );
};

export default PaymentResult;
