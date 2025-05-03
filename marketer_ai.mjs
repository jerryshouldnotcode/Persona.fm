import OpenAI from "openai";
import 'dotenv/config';

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const prompt = `You are a digital marketing strategist using Spotify user data to build psychographic audience profiles for precision-targeted advertising.
                Your task is to analyze the user's listening behavior and produce:
                1. A 2–3 sentence marketing persona summarizing their lifestyle, aesthetic, and cultural leanings. Use language familiar to brand marketers and advertisers.
                2. A list of 3 highly specific product examples or ad campaign hooks (not just general categories). Use brand names, niche trends, or product features where possible 
                — things that would actually show up in a hyper-targeted Instagram or TikTok ad.`;

const response = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{
        role: "user",
        content: prompt
    }]
});

console.log(response.choices[0].message.content);