import { fetchPaperByPubkey } from "@/app/store/paperStore";

// Fetch the researcher profile
export const fetchProfile = async (pubkey: string) => {
  const response = await fetch(
    `/api/researcher-profile?researcherPubkey=${pubkey}`,
    { cache: "force-cache" },
  );
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

// Get the URL for the tab data based on the tab and pubkey
const getTabUrl = (tab: string, pubkey: string): string => {
  switch (tab) {
    case "contributions":
      return `/api/research?researcherPubkey=${pubkey}`;
    case "peer-reviews":
      return `/api/peer-review?reviewerPubkey=${pubkey}`;
    case "paid-reads":
      return `/api/mint?researcherPubkey=${pubkey}`;
    default:
      throw new Error(`Unsupported tab: ${tab}`);
  }
};

export const fetchTabData = async (tab: string, pubkey: string) => {
  const url = getTabUrl(tab, pubkey);
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  let data = await response.json();

  // Fetch the paper for the peer-reviews tab
  if (tab === "peer-reviews" && Array.isArray(data)) {
    data = await Promise.all(
      data.map(async (review) => {
        const papers = await fetchPaperByPubkey(review.paperPubkey);
        return { ...review, papers };
      }),
    );
  }

  return Array.isArray(data) ? data : [];
};
