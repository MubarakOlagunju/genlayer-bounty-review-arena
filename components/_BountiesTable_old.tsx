"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddressDisplay } from "./AddressDisplay";
import { useBountyData, useSubmitWork } from "@/lib/hooks/useBounty";
import { useWallet } from "@/lib/genlayer/wallet";

export function BountiesTable() {
  const { data: bounty, isLoading, isError } = useBountyData();
  const { submitWork, isSubmitting } = useSubmitWork();
  const { address } = useWallet();
  const [submissionUrl, setSubmissionUrl] = useState("");

  if (isLoading) return <div className="text-white p-4">Loading Bounty Data...</div>;
  if (isError || !bounty) return <div className="text-red-500 p-4">Error loading contract. Check your address.</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionUrl || !address) return;
    
    submitWork(submissionUrl);
    
    // This clears the input field immediately so it is ready for the next link
    setSubmissionUrl("");
  };

  return (
    <div className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 text-white shadow-xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{bounty.title}</h2>
          <p className="text-gray-400 text-sm">Reward: {bounty.reward_amount.toString()} GEN</p>
        </div>
        <Badge variant={bounty.is_open ? "default" : "secondary"}>
          {bounty.is_open ? "Open for Submissions" : "Closed / Paid"}
        </Badge>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Evaluation Criteria:</h3>
        <p className="bg-white/5 p-4 rounded-lg text-sm border border-white/5">
          {bounty.criteria}
        </p>
      </div>

      {bounty.is_open ? (
        <form onSubmit={handleSubmit} className="flex gap-4 items-end mt-4">
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1 block">Your Work URL (GitHub, Website, etc.)</label>
            <input 
              type="url"
              required
              value={submissionUrl}
              onChange={(e) => setSubmissionUrl(e.target.value)}
              placeholder="https://github.com/your-repo"
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              disabled={isSubmitting} 
            />
          </div>
          <Button type="submit" disabled={isSubmitting || !submissionUrl || !address}>
            {isSubmitting ? "Evaluating..." : "Submit Work"}
          </Button>
        </form>
      ) : (
        <div className="mt-6 border-t border-white/10 pt-4 bg-green-900/20 -mx-6 -mb-6 p-6 rounded-b-xl">
          <h3 className="text-sm font-bold text-green-400 mb-3">Bounty Completed!</h3>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Winner:</span>
              <AddressDisplay address={bounty.winner_address} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Winning Submission:</span>
              <a href={bounty.winning_submission_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline truncate max-w-xs">
                {bounty.winning_submission_url}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}