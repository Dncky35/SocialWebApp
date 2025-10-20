"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import LoadingComponent from "@/components/Loading";

const Login: React.FC = () => {
  const { isLoading, login, error } = useAuth();
  const [formData, setFormData] = useState([
    { name: "email", type: "text", error: "", value: "" },
    { name: "password", type: "password", error: "", value: "" },
  ]);

  const handleOnValueChange = (key: string, value: string) => {
    setFormData((prev) =>
      prev.map((field) =>
        field.name === key ? { ...field, value } : field
      )
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      username: formData[0].value,
      password: formData[1].value,
    };
    if (!isLoading) await login(payload.username, payload.password);
  };

  return (
    <div className="flex-grow flex container max-w-lg items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-cyan-950 to-violet-900">
      <div className="w-full max-w-md">
        {isLoading && <LoadingComponent />}
        <form
          className="py-6 px-8 rounded-2xl shadow-xl bg-slate-800/80 backdrop-blur-md border border-slate-700"
          onSubmit={handleSubmit}
        >
          <h2 className="text-3xl font-extrabold text-center mb-6 text-white">
            Log In
          </h2>
          {formData.map((field, index) => (
            <div key={index} className="mb-4">
              <label
                htmlFor={field.name}
                className="block text-sm font-medium mb-1 text-gray-200 capitalize"
              >
                {field.name}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                required
                value={field.value}
                onChange={(e) => handleOnValueChange(field.name, e.target.value)}
                className="w-full bg-slate-700 text-white border border-gray-600 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-400 transition"
                placeholder={field.name}
              />
              {field.error && (
                <p className="text-red-500 text-sm mt-1">{field.error}</p>
              )}
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-gradient-to-br from-cyan-500 to-violet-500 hover:scale-105 hover:shadow-lg text-white font-semibold py-2 rounded-xl transition duration-300"
          >
            Log In
          </button>
        </form>
        <div className="mt-6 text-center text-gray-200">
          <p>
            Don't have an account?{" "}
            <Link
              href={"/auth/signup"}
              className="font-semibold italic text-cyan-400 hover:text-cyan-200 underline"
            >
              Sign Up
            </Link>
            .
          </p>
        </div>
        {error && (
          <div className="mt-4 text-red-400 text-center text-lg rounded py-2">
            {error.detail}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
