export const BASE_URL = 'https://api.loyos.app';
export const CANCEL_URL = 'https://chat.loyos.app';
export const RETURN_URL = 'https://chat.loyos.app/payment';
export const PAYOS_BASE_URL = 'https://api-merchant.payos.vn/v2/';
export const PAYOS_CLIENT_ID = '938b6546-7746-4e92-bc94-13a4480fc265';
export const PAYOS_API_KEY = '7744119e-a8a3-40ac-af82-38fc237a805e';

export type Response<T> = {
  status: number;
  data: T;
};
