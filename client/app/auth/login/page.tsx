"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import LoadingComponent from "@/components/Loading";

const Login:React.FC = () => {
	const { isLoading, login, error } = useAuth();
	const [formData, setFormData] = useState([
		{name: "email", type: "text", error:"", value:""},
		{name: "password", type: "password", error:"", value:""},
	]);

	const handleOnValueChange = (key:string, value:string) => {
		setFormData((prev) => {
			const updated = [...prev];

			updated.map((field) => {
				if(field.name === key){
					field.value = value;
				}
				return field;
			});

			return updated;
		});
	};

	const handleSubmit  = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const payload = {
			username: formData[0].value,
			password: formData[1].value,
		};

		if(!isLoading)
			await login(payload.username, payload.password);
	};

	return (
		<div className="flex items-center justify-center p-4 rounded shadow-xl">
			<div className="w-full max-w-md">
				{isLoading && (
					<LoadingComponent />
				)}
				<form className="py-6 px-8 rounded shadow-md bg-emerald-900"
					onSubmit={(e) => handleSubmit(e)}>
					<h2 className="text-2xl font-bold text-center mb-4">
						Log In
					</h2>
					{formData.map((field, index) => (
						<div key={index} className="mb-4">
							<label
								htmlFor={field.name}
								className="block text-sm font-medium mb-1 capitalize"
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
								className="w-full bg-white text-emerald-900 border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
							{field.error && (
								<p className="text-red-500 text-sm mt-1">{field.error}</p>
							)}
						</div>
					))}
					<button
						type="submit"
						className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded transition duration-200"
						>
						Log In
					</button>

					{/* {error && (
						<div className="mt-4 text-red-600 text-center text-sm">
							{JSON.stringify(error)}
						</div>
					)} */}
				</form>
				<div className="mt-4 text-center">
					<p>
						If you don NOT have an account,{" "}
						<Link href={"/auth/signup"} className="font-semibold italic text-lg underline cursor-pointer">
							Sign Up
						</Link>{" "}
						from here.
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