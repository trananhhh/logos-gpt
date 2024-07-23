import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const PaymentHistory = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="py-2">
              <TableCell>July 23, 2024</TableCell>
              <TableCell>$99.99</TableCell>
              <TableCell>Visa **** 4321</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-green-500 p-1 text-green-50">
                    <CircleCheckIcon className="h-4 w-4" />
                  </div>
                  <span>Successful</span>
                </div>
              </TableCell>
            </TableRow>
            <TableRow className="h-14 py-2">
              <TableCell>June 15, 2024</TableCell>
              <TableCell>$49.99</TableCell>
              <TableCell>MasterCard **** 2345</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-red-500 p-1 text-red-50">
                    <CircleXIcon className="h-4 w-4" />
                  </div>
                  <span>Failed</span>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

function CircleCheckIcon(props) {
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

function CircleXIcon(props) {
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

function XIcon(props) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default PaymentHistory;
