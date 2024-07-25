import dayjs from 'dayjs';
import { PaymentInfoResponse } from '../../api/payment-info';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import PaymentItem from './PaymentItem';

const PaymentResult = ({ data }: { data?: PaymentInfoResponse }) => {
  return (
    <Card className="dark:text-white">
      <CardHeader>
        <CardTitle>Chi tiết giao dịch</CardTitle>
        {/* <CardTitle>Transaction Details</CardTitle> */}
      </CardHeader>
      <CardContent className="grid gap-3">
        <PaymentItem label={'Mã đơn hàng'} content={data?.orderCode.toString()} />
        {/* <PaymentItem label={'Order Code'} content={data?.orderCode.toString()} /> */}

        <PaymentItem
          label={'Số tiền'}
          // label={'Amount'}
          content={data?.amount.toLocaleString('it-IT', {
            style: 'currency',
            currency: 'vnd',
          })}
        />

        <PaymentItem
          //  label={'Time'}
          label={'Thời gian'}
          content={dayjs(data?.createdAt).format('HH:mm DD/MM/YYYY')}
        />
      </CardContent>
    </Card>
  );
};

export default PaymentResult;
