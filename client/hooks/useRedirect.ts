import { useEffect } from "react";
import { useRouter } from "next/navigation";

type useRedirectOptions = "feed" | "home";

const useRedirect = ( options?:useRedirectOptions) => {
    const router = useRouter();

    useEffect(() => {
        if(typeof window === "undefined")
            return;

        const token = document.cookie.split("; ").find((row) => row.startsWith("refreshToken="))?.split("=")[1];

        if(token && options && options === "feed"){
            router.push("/feed");
        }

        if(!token && options && options === "home"){
           router.push("/"); 
        }

    }, [router]);
}

export default useRedirect;