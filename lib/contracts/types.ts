/**
 * TypeScript types for GenLayer Bounty Review contract
 */

export interface BountyData {
  title: string;
  criteria: string;
  reward_amount: bigint | number | string;
  is_open: boolean;
  winner_address: string;
  winning_submission_url: string;
}

export interface TransactionReceipt {
  status: string;
  hash: string;
  blockNumber?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}