import Link from "next/link";

const Footer:React.FC = () => {
    return (
        <footer className="bg-cyan-950 text-white py-2">
            <div className="flex items-center justify-between md:flex-row px-4">
                <div></div>
                <div>
                    <p className="text-xs italic" >Powered by</p>
                    <Link href={"https://cloudrocean.xyz/"} className="text-md font-semibold">© 2025 CloudROcean</Link>
                </div>
            </div>
        </footer>
    );
}

export default Footer;