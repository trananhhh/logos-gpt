import axios from 'axios';
import { BASE_URL, Response } from '.';

interface SubscribeParams {
  userId?: string;
  email?: string;
  orderCode: number;
  affectNow: boolean;
}

interface SubscribeResponse {
  amount: number;
  message: string;
  monthlyTokenCredits: number;
  tokenCredits: number;
  user: string;
}

export const subscribe = async (params: SubscribeParams): Promise<SubscribeResponse> => {
  try {
    const response = await axios.post<Response<SubscribeResponse>>(BASE_URL + '/subscribe', null, {
      params: {
        orderCode: params.orderCode,
        userId: params.userId,
        email: params.email,
        affectNow: params.affectNow ?? false,
        context: 'subscribe',
      },
    });

    return response.data.data as SubscribeResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error creating payment link:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};
