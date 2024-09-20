export const minimizePubkey = (pubkey: string) => {
  return pubkey.slice(0, 4) + "..." + pubkey.slice(-4);
};

export enum Role {
  Researcher = "Researcher",
  Reader = "Reader",
}

// Generate random gradient
const topColors = [
  "#4318FF",
  "#FFAD08",
  "#00B69B",
  "#DC6262",
  "#919393",
  "#FF1875",
  "#51A637",
  "#A984FF",
];

export const generateRandomGradient = () => {
  const getRandomTopColor = () =>
    topColors[Math.floor(Math.random() * topColors.length)];
  const topColor = getRandomTopColor();
  return `linear-gradient(to bottom, ${topColor}, #9574E2)`;
};

// Format large numbers with 'k' for thousands
export const formatNumber = (num: number): string => {
  return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString();
};
