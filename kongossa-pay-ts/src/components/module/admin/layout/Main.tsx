export default function Main({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 md:ml-60 p-6 min-h-[calc(100vh-4rem)]
        bg-gray-50 text-gray-900
        dark:bg-black dark:text-gray-100">
      {children}
    </main>
  );
}
