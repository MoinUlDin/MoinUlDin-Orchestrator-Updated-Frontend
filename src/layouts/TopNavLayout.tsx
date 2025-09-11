// src/layouts/TopNavLayout.tsx
import React from "react";
import TopNavBar from "../components/TopNavBar";

type Props = {
  children: React.ReactNode;
};

export default function TopNavLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopNavBar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
