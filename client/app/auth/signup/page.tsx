"use client"
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { FormEvent, useState } from "react";

const Signup:React.FC = () => {
	const { signUp, isLoading, error } = useAuth();

	const [formData, setFormData] = useState([
		{name: "email", type: "email", error:"", value:""},
		{name: "username", type: "text", error:"", value:""},
		{name: "password", type: "password", error:"", value:""},
		{name: "confirmPassword", type: "password", error:"", value:""},
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

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const payload = {
			email: formData[0].value,
			username: formData[1].value,
			password: formData[2].value,
		};

		await signUp(payload.email, payload.username, payload.password);

		// const result = await postData(`${BASE_URL}auth/signup`, payload);

		// if(result)
		// 	setAccount(result);
	};

	return (
		<div className="flex items-center justify-center p-4 rounded shadow-xl">
			<div className="w-full max-w-md">
				{isLoading && (
					<div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
						<div className="bg-white rounded-lg shadow-lg p-6 max-w-xl text-center text-lg font-semibold text-emerald-900">
							Creating account...
						</div>
					</div>
				)}
				<form
					className="bg-emerald-900 py-6 px-8 rounded shadow-md"
					onSubmit={(e) => handleSubmit(e)}
					>
					<h2 className="text-2xl font-bold text-center mb-4">
						Create an Account
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
								className="w-full bg-white text-green-900 border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
							{field.error && (
								<p className="text-red-500 text-sm mt-1">{field.error}</p>
							)}
						</div>
					))}
					<button
						type="submit"
						className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 cursor-pointer rounded transition duration-200"
						>
						Sign Up
					</button>

					{error && (
						<div className="mt-4 text-red-400 text-center text-lg rounded py-2">
							{error.detail}
						</div>
					)}

					{/* {error && (
						<div className="mt-4 text-red-600 text-center text-sm">
							{JSON.stringify(error)}
						</div>
					)} */}
				</form>

				<div className="mt-4 text-center">
					<p>
						If you already have an account,{" "}
						<Link href={"/auth/login"} className="font-semibold italic text-lg underline cursor-pointer">
							Log In
						</Link>{" "}
						from here.
					</p>
				</div>
			</div>
		</div>

	);
};

export default Signup;