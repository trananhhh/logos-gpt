import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function generateNumericId(): string {
  // Generate a UUID
  const uuid = crypto.randomUUID();

  // Remove hyphens and convert to BigInt
  const bigInt = BigInt(`0x${uuid.replace(/-/g, '')}`);

  // Convert to string and pad with zeros
  return bigInt.toString().padStart(20, '0').slice(0, 16);
}

export function parsePaymentResponse(response: string) {
  try {
    // Parse the outer array
    const parsedArray = JSON.parse(response);

    // Ensure the array contains exactly one element
    if (!Array.isArray(parsedArray) || parsedArray.length !== 1) {
      throw new Error('Invalid response format: expected an array with one element');
    }

    // Parse the inner JSON string
    const paymentData = JSON.parse(parsedArray[0]);

    return paymentData;
  } catch (error) {
    console.error('Error parsing payment response:', error);
    throw new Error('Failed to parse payment response');
  }
}
