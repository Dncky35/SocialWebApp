import Link from "next/link";

const Footer:React.FC = () => {
    return (
        <footer className="fixed bottom-0 w-full bg-emerald-950/50 text-white py-2 z-50 backdrop-blur-sm">
            <div className="flex items-center justify-between md:flex-row px-4">
                <div></div>
                <div>
                    <p className="text-xs italic" >Powered by</p>
                    <Link href={"https://cloudrocean.xyz/"} className="text-md font-semibold hover:underline">© 2025 CloudROcean</Link>
                </div>
            </div>
        </footer>
    );
}

export default Footer;