'use strict'

// Load environment variables from .env file
import 'dotenv/config'

// Import printing tools
import { marked } from 'marked'
import { markedTerminal } from 'marked-terminal'

marked.use(markedTerminal());

// Import AI providers SDKs
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'

// Prompt to generate content
const prompt = 'Háblame sobre la comunidad MedellinJS';

// Function to print replies
function printReply(reply) {
  console.log(marked.parse(reply))
}

// Generate content using Gemini
async function helloGemini() {
  // @TODO: Implement Gemini SDK usage
}

// Generate content using OpenAI
async function helloOpenAI() {
  // @TODO: Implement OpenAI SDK usage
}

if (process.env.GEMNINI_API_KEY) {
  helloGemini();
}

if (process.env.OPENAI_API_KEY) {
  helloOpenAI();
}

