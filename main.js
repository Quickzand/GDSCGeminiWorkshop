import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const API_KEY = "AIzaSyCVHtqe6fOg38z9KvpDQXCAvOklvrs-8Kk";

const genAI = new GoogleGenerativeAI(API_KEY);

async function fileToGenerativePart(file) {
	const base64EncodedDataPromise = new Promise((resolve) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result.split(",")[1]);
		reader.readAsDataURL(file);
	});
	return {
		inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
	};
}

async function getPrompt() {
	const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

	const prompt =
		"Give me an accurate estimate of the nutritional facts in this picture";

	const imageInputElement = document.querySelector("input[type=image]");
	const image = await Promise.all(
		[...imageInputElement.files].map(fileToGenerativePart)
	);

	const result = await model.generateContent([prompt, ...image]);
	const response = await result.response;
	const text = response.text();

	return text;
}

async function sendPrompt() {
	const result = await getPrompt();

	document.querySelector("#calories.value").innerText = result.;
}

const imageUploadElement = document.querySelector("input[type=file]");
imageUploadElement.addEventListener("onchange", sendPrompt);
