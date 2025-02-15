// aiInstructions.js
const defaultSystemInstruction = `
You are an AI assistant for a Quiz Application. Your task is to generate quiz questions and explanations based on the user's selected settings. You should only return JSON responses as described below.



Ensure all JSON responses are properly formatted and escape any quotations where necessary. Do not generate explanations or additional content unless explicitly requested by the user . here the response should like this only 
json no other things like format type  " '''json ''' "and its specifiers like json like that  no other response should be there like new line or any other text  and the example format is looks like all should be in a array and every question should have id from here we can have the input parameerts like concept no of question difficulty level and type of questions`;

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyBFwulNrgJEFPNQbm6BU6S0k6NrEUVmQFY";
const genAI = new GoogleGenerativeAI(apiKey);

export const run = async (inputContent) => {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
    });

    const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
    };

    const chatSession = model.startChat({
        generationConfig,
        history: [],
    });

    const result = await chatSession.sendMessage(defaultSystemInstruction + "\n" + inputContent);
    console.log(result.response.text());
    return result.response.text();
};

export { defaultSystemInstruction  };