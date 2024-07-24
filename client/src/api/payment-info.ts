import axios from 'axios';
import { BASE_URL, Response } from '.';

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

export interface PaymentInfoResponse {
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

export const getPaymentInfo = async (orderCode: string): Promise<PaymentInfoResponse> => {
  try {
    const response = await axios.get<Response<PaymentInfoResponse>>(BASE_URL + '/payment-info', {
      params: {
        orderCode,
      },
    });

    return response?.data?.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error getPaymentInfo:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};
