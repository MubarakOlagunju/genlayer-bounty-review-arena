"use client";

import { useState } from "react";
import { useCreateBounty } from "../lib/hooks/useBounty";

interface CreateBountyProps {
  contractAddress: string;
  userAddress: string;
}

export default function CreateBounty({ contractAddress, userAddress }: CreateBountyProps) {
  const [title, setTitle] = useState("");
  const [criteria, setCriteria] = useState("");
  const [reward, setReward] = useState("");

  const { mutateAsync: createBounty, isPending, isSuccess, error } = useCreateBounty(
    contractAddress,
    userAddress
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !criteria || !reward) return;

    try {
      await createBounty({
        title,
        criteria,
        // Convert the string input to BigInt for the smart contract
        rewardAmount: BigInt(reward), 
      });
      
      // Reset form after a successful transaction
      setTitle("");
      setCriteria("");
      setReward("");
    } catch (err) {
      console.error("Failed to mint bounty:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 border border-gray-800 rounded-xl shadow-lg mt-8">
      <h2 className="text-2xl font-bold text-white mb-6">Mint a New Bounty</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Bounty Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., Build a React Authentication Hook"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Strict AI Evaluation Criteria</label>
          <textarea
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white h-32 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Provide exact instructions the AI should use to grade the submission..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Reward Amount ($GEN Tokens)</label>
          <input
            type="number"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="100"
            min="1"
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-900/50 border border-red-500 text-red-200 rounded-lg text-sm">
            Transaction failed. Make sure your wallet is connected.
          </div>
        )}

        {isSuccess && (
          <div className="p-3 bg-green-900/50 border border-green-500 text-green-200 rounded-lg text-sm">
            Bounty successfully minted on GenLayer!
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || !userAddress}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {isPending ? "Minting to Blockchain..." : "Deploy Bounty"}
        </button>
      </form>
    </div>
  );
}