import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import BountyFactoryContract from "../contracts/BountyContract";
import { useState, useEffect } from "react";

// Hook to fetch all bounties
export function useAllBounties(contractAddress: string, userAddress?: string) {
  return useQuery({
    queryKey: ["allBounties", contractAddress],
    queryFn: async () => {
      if (!contractAddress) return {};
      const contract = new BountyFactoryContract(contractAddress, userAddress);
      return await contract.getAllBounties();
    },
    enabled: !!contractAddress,
    // FIX 1: This tells the app to silently auto-refresh the bounties every 3 seconds!
    refetchInterval: 3000, 
  });
}

// Hook to create a brand new bounty
export function useCreateBounty(contractAddress: string, userAddress: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, criteria, rewardAmount }: { title: string; criteria: string; rewardAmount: bigint; }) => {
      const contract = new BountyFactoryContract(contractAddress, userAddress);
      return await contract.createBounty(title, criteria, rewardAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allBounties"] });
    },
  });
}

// Hook to evaluate a submission
export function useEvaluateSubmission(contractAddress: string, userAddress: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bountyId, submissionUrl }: { bountyId: number; submissionUrl: string; }) => {
      const contract = new BountyFactoryContract(contractAddress, userAddress);
      return await contract.evaluateSubmission(bountyId, submissionUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allBounties"] });
    },
  });
}

// FIX 2: Restored Submission History Hook using Local Storage
export function useSubmitWork() {
  const [submissions, setSubmissions] = useState<any[]>([]);

  // Load history from browser storage when the page loads
  useEffect(() => {
    const saved = localStorage.getItem("genlayer_bounty_history");
    if (saved) {
      try {
        setSubmissions(JSON.parse(saved));
      } catch (err) {}
    }

    // Listen for custom events so the UI updates instantly without refreshing
    const handleStorageChange = () => {
      const updated = localStorage.getItem("genlayer_bounty_history");
      if (updated) setSubmissions(JSON.parse(updated));
    };
    window.addEventListener("history_updated", handleStorageChange);
    return () => window.removeEventListener("history_updated", handleStorageChange);
  }, []);

  // Function to save a new submission
  const recordSubmission = (title: string, url: string, status: string) => {
    const newRecord = {
      id: Date.now().toString(),
      title: title, 
      url: url,
      status: status,
      date: new Date().toLocaleDateString(),
    };
    
    const saved = localStorage.getItem("genlayer_bounty_history");
    const current = saved ? JSON.parse(saved) : [];
    const updated = [newRecord, ...current];
    
    localStorage.setItem("genlayer_bounty_history", JSON.stringify(updated));
    window.dispatchEvent(new Event("history_updated")); // Force UI to update instantly
  };

  return { submissions, recordSubmission };
}