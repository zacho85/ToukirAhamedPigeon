interface Props {
  title: string;
}

// Placeholder for pages that land in Step 3 (cash-in/out forms, day
// settlement, float requests, transaction history, settings) -- the shell,
// auth, and dashboard built in Step 2 route to these so nothing 404s inside
// the app while that work is still pending.
export default function ComingSoon({ title }: Props) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
      <p className="text-lg font-semibold text-[#0B1226]">{title}</p>
      <p className="text-sm text-gray-400 mt-2">Coming soon</p>
    </div>
  );
}
