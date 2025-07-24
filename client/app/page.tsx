"use client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import useRedirect from "@/hooks/useRedirect";

const RootPage:React.FC = () => {
  const { account } = useAuth();
  useRedirect("feed");

  return (
    <div>
      { account ? null : (
        <div className="fixed inset-0 flex justify-center items-center bg-black/80 z-50">
          <div className="p-4 rounded shadow-xl">
            <h1 className="text-center font-bold text-2xl mt-2">You haven&apos;t Signin yet</h1>
            <div className="mt-4 text-center">
              <p>
                If you don NOT have an account,{" "}
                <Link href={"/auth/signup"} className="font-semibold italic text-lg underline cursor-pointer">
                  Sign Up
                </Link>{" "}
                from here.
              </p>
            </div>
            <div className="mt-4 text-center">
              <p>
                If you have an account,{" "}
                <Link href={"/auth/login"} className="font-semibold italic text-lg underline cursor-pointer">
                  Login
                </Link>{" "}
                from here.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RootPage;
