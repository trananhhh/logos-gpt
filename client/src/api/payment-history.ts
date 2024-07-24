import axios from 'axios';
import { BASE_URL, Response } from '.';

export interface PaymentHistoryResponse {
  _id: string;
  user: string;
  orderCode: number;
  amount: number;
  plan: number;
  duration: number;
  status: string;
  createAt: string;
  context: string;
  handled: boolean;
  monthlyTokenCredits: number;
  remainMonthlyTokenCredits: number;
  tokenCredits?: number;
}

export const getPaymentHistory = async (email?: string): Promise<PaymentHistoryResponse[]> => {
  try {
    const response = await axios.get<Response<string>>(BASE_URL + '/payment-history', {
      params: {
        email,
      },
    });

    const res = JSON.parse(response?.data?.data) as PaymentHistoryResponse[];

    return res;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error gsetPaymentHistory:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};
