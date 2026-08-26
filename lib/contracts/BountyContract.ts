import { createClient } from "genlayer-js";

export default class BountyFactoryContract {
  private client;
  public contractAddress: string;
  public userAddress?: string;

  constructor(contractAddress: string, userAddress?: string, studioUrl?: string) {
    this.contractAddress = contractAddress;
    this.userAddress = userAddress;
    
    this.client = createClient({
      endpoint: studioUrl || process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api",
    });
  }

  /**
   * Fetches every bounty currently deployed on the factory contract.
   */
  async getAllBounties(): Promise<Record<string, any>> {
    try {
      const data = await this.client.readContract({
        address: this.contractAddress as `0x${string}`,
        functionName: "get_all_bounties",
        args: [],
      });
      
      // We parse the JSON string coming back from our Python contract
      return JSON.parse(data as string);
    } catch (error) {
      console.error("Error fetching all bounties:", error);
      return {};
    }
  }

  /**
   * Mints a brand new AI-judged bounty on the blockchain.
   */
  async createBounty(title: string, criteria: string, rewardAmount: bigint): Promise<any> {
    if (!this.userAddress || !this.userAddress.startsWith("0x")) {
      throw new Error("Invalid wallet address. Please reconnect.");
    }

    try {
      const tx = await this.client.writeContract({
        address: this.contractAddress as `0x${string}`,
        functionName: "create_bounty",
        // We pass Number(rewardAmount) because our Python contract expects a standard int
        args: [title, criteria, Number(rewardAmount)],
        account: { address: this.userAddress as `0x${string}` } as any,
        value: 0n, 
      });
      
      return tx;
    } catch (error) {
      console.error("Error creating bounty:", error);
      throw error; 
    }
  }

  /**
   * Submits a URL to a specific bounty for AI evaluation.
   */
  async evaluateSubmission(bountyId: number, submissionUrl: string): Promise<any> {
    if (!this.userAddress || !this.userAddress.startsWith("0x")) {
      throw new Error("Invalid wallet address. Please reconnect.");
    }

    try {
      const tx = await this.client.writeContract({
        address: this.contractAddress as `0x${string}`,
        functionName: "evaluate_submission",
        args: [bountyId, submissionUrl],
        account: { address: this.userAddress as `0x${string}` } as any,
        value: 0n, 
      });
      
      return tx;
    } catch (error) {
      console.error("Error evaluating submission:", error);
      throw error; 
    }
  }
}