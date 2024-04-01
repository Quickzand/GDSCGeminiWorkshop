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

async function sendPrompt() {
	const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

	const prompt =
		"Give me an accurate estimate of the nutritional facts in this picture. Please format these nutritional facts as a json file. Elements inside of the json should include: calories, totaFat, satFat, transFat, cholesterol, sodium, totalCarbs, fiber, sugars, and protein. Do not include units. If you believe the image to be something other than food, please send a json file with only a field called isFood set to false.";

	const image = await Promise.all(
		[...imageUploadElement.files].map(fileToGenerativePart)
	);

	const result = await model.generateContent([prompt, ...image]);
	const response = await result.response;
	const text = response.text();

	return text;
}

async function getNutrition() {
	loadingElement.classList.add("show");
	imageUploadDecorationElement.style.display = "none";

	let result = await sendPrompt();
	result = result.split("json")[1];
	result = result.split('`')[0];

	result = JSON.parse(result);

	if (!result.isFood) {
		alert("This is not food.");
		return;
	}

	loadingElement.classList.remove("show");
	imageUploadDecorationElement.style.display = "block";

	document.querySelector("#calories .value").innerHTML = result.calories;
	document.querySelector("#totalFat .value").innerHTML = `${result.totalFat}g`;
	document.querySelector("#saturatedFat .value").innerHTML = `${result.satFat}g`;
	document.querySelector("#transFat .value").innerHTML = `${result.transFat}g`;
	document.querySelector("#cholesterol .value").innerHTML = `${result.cholesterol}mg`;
	document.querySelector("#sodium .value").innerHTML = `${result.sodium}mg`;
	document.querySelector("#totalCarbohydrate .value").innerHTML = `${result.totalCarbs}g`;
	document.querySelector("#dietaryFiber .value").innerHTML = `${result.fiber}g`;
	document.querySelector("#sugars .value").innerHTML = `${result.sugars}g`;
	document.querySelector("#protein .value").innerHTML = `${result.protein}g`;
}

const imageUploadElement = document.querySelector("input[type=file]");
imageUploadElement.addEventListener("change", getNutrition);

const imageUploadDecorationElement = document.querySelector("#imageUploadDecoration");

const loadingElement = document.querySelector("#loadingIcon");