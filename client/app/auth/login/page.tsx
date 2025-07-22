"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";

const Login:React.FC = () => {

	const [formData, setFormData] = useState([
		{name: "email", type: "text", error:"", value:""},
		{name: "password", type: "password", error:"", value:""},
	]);

	const handleOnValueChange = (key:string, value:string) => {
		setFormData((prev) => {
			let updated = [...prev];

			updated.map((field, index) => {
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

		// const result = await postData(`${BASE_URL}auth/login`, payload);

		// if(result)
		// 	setAccount(result);
	};

	return (
		<div className="flex items-center justify-center p-4 rounded shadow-xl">
			<div className="w-full max-w-md">
				<form className="py-6 px-8 rounded shadow-md bg-cyan-900"
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
								className="w-full bg-white text-cyan-900 border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
			</div>
		</div>
	);
};

export default Login;