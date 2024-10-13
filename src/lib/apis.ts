// Fetch the researcher profile
export const fetchProfile = async (pubkey: string) => {
  const response = await fetch(
    `/api/researcher-profile?researcherPubkey=${pubkey}`,
    { cache: "no-store" },
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
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};