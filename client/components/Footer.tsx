import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 w-full bg-slate-950/60 text-gray-100 py-2 z-50 backdrop-blur-sm border-t border-slate-800">
      <div className="flex items-center justify-between md:flex-row px-4">
        <div></div>
        <div className="flex flex-col items-end">
          <p className="text-xs italic text-gray-400">Powered by</p>
          <Link
            href={"https://cloudrocean.xyz/"}
            className="text-md font-semibold text-cyan-400 hover:text-violet-400 transition-colors hover:underline"
          >
            © 2025 CloudROcean
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
