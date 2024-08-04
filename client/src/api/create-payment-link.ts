import axios from 'axios';
import { BASE_URL, Response } from '.';

interface PaymentLinkParams {
  orderCode: number;
  plan: number;
  duration: number;
  amount: number;
  cancelUrl: string;
  returnUrl: string;
  userId?: string;
  email?: string;
}

interface PaymentResponse {
  bin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
  orderCode: number;
  currency: string;
  paymentLinkId: string;
  status: string;
  checkoutUrl: string;
  qrCode: string;
  message?: string;
}

interface DowngradeResponse {
  message: string;
}

export const createPaymentLink = async (
  params: PaymentLinkParams,
): Promise<PaymentResponse | null> => {
  try {
    const response = await axios.post<Response<PaymentResponse | DowngradeResponse>>(
      BASE_URL + '/create-payment-link',
      null,
      {
        params: {
          orderCode: params.orderCode,
          plan: params.plan,
          duration: params.duration,
          amount: params.amount,
          cancelUrl: params.cancelUrl,
          returnUrl: params.returnUrl,
          userId: params.userId,
          email: params.email,
        },
      },
    );
    if (response.data.data?.message && response.data.data?.message?.length > 0) {
      return null;
    } else {
      return JSON.parse(response.data.data[0]) as PaymentResponse;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error creating payment link:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};
