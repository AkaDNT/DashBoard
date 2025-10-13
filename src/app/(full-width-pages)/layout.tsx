import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Mobile Shop App Dashboard",
  description: "This is dashboard for mobile shop app project",
};

export default function FullWidthPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
