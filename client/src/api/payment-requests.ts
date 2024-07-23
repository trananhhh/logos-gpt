import axios from 'axios';
import { PAYOS_API_KEY, PAYOS_BASE_URL, PAYOS_CLIENT_ID } from '.';

interface Transaction {
  reference: string;
  amount: number;
  accountNumber: string;
  description: string;
  transactionDateTime: string;
  virtualAccountName: string | null;
  virtualAccountNumber: string | null;
  counterAccountBankId: string | null;
  counterAccountBankName: string | null;
  counterAccountName: string | null;
  counterAccountNumber: string | null;
}

interface PaymentRequestData {
  id: string;
  orderCode: number;
  amount: number;
  amountPaid: number;
  amountRemaining: number;
  status: string;
  createdAt: string;
  transactions: Transaction[];
  cancellationReason: string | null;
  canceledAt: string | null;
}

export interface PaymentRequestResponse {
  code: string;
  desc: string;
  data: PaymentRequestData;
  signature: string;
}

export const getPaymentRequest = async (id: string): Promise<PaymentRequestResponse> => {
  try {
    const response = await axios.get(PAYOS_BASE_URL + 'payment-requests/' + id, {
      headers: {
        'x-client-id': PAYOS_CLIENT_ID ?? '',
        'x-api-key': PAYOS_API_KEY ?? '',
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error getPaymentRequest:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};
