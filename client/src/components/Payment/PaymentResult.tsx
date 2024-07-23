import dayjs from 'dayjs';
import { PaymentRequestResponse } from '../../api/payment-requests';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import PaymentItem from './PaymentItem';

const PaymentResult = ({ data }: { data?: PaymentRequestResponse }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <PaymentItem label={'Order Code'} content={data?.data?.orderCode.toString()} />

        <PaymentItem
          label={'Amount'}
          content={data?.data?.amount.toLocaleString('it-IT', {
            style: 'currency',
            currency: 'vnd',
          })}
        />

        <PaymentItem
          label={'Time'}
          content={dayjs(data?.data.createdAt).format('HH:mm DD/MM/YYYY')}
        />
      </CardContent>
    </Card>
  );
};

export default PaymentResult;
