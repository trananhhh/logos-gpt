type Props = {
  label: string;
  content?: string;
};

const PaymentItem = ({ label, content }: Props) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{content}</span>
    </div>
  );
};

export default PaymentItem;
