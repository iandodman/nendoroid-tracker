export type Nendoroid = {
  id: number;
  number: string;
  name: string;
  series: string;
  imageUrl: string;
  isOwned?: boolean;
  isWishlisted?: boolean;
};