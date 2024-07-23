import axios from 'axios';
import { BASE_URL } from '.';

interface PaymentLinkParams {
  orderCode: number;
  plan: number;
  duration: number;
  amount: number;
  cancelUrl: string;
  returnUrl: string;
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
}

export const createPaymentLink = async (params: PaymentLinkParams): Promise<PaymentResponse> => {
  try {
    const response = await axios.post(BASE_URL + '/create-payment-link', null, {
      params: {
        orderCode: params.orderCode,
        plan: params.plan,
        duration: params.duration,
        amount: params.amount,
        cancelUrl: params.cancelUrl,
        returnUrl: params.returnUrl,
      },
    });

    return JSON.parse(response?.data[0]) as PaymentResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error creating payment link:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};
