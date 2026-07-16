import BottomNavigation from "@/components/navigation/BottomNavigation";

type CatalogLayoutProps = {
  children: React.ReactNode;
};

export default function CatalogLayout({
  children,
}: CatalogLayoutProps) {
  return (
    <>
      {children}
      <BottomNavigation />
    </>
  );
}