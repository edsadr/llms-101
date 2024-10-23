'use strict'

// Load environment variables from .env file
import 'dotenv/config'

// Import printing tools
import { marked } from 'marked'
import { markedTerminal } from 'marked-terminal'
import { bgCyan, bgYellow, white } from 'colorette'

// Import AI providers SDKs
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
marked.use(markedTerminal())

// Prompt to generate content
const prompt = 'Háblame sobre la comunidad MedellinJS'

// Function to print replies
function printReply (reply) {
  console.log(marked.parse(reply))
}

// Generate content using Gemini
async function helloGemini () {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent(prompt)
    console.log(bgYellow(white('Reply from Gemini:\n')))
    printReply(result.response.text())
  } catch (error) {
    console.error(`Error: ${error.message}`)
  }
}

// Generate content using OpenAI
async function helloOpenAI () {
  try {
    const openai = new OpenAI()
    const result = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }]
    })

    console.log(bgCyan(white('Reply from OpenAI:\n')))
    printReply(result.choices[0].message.content)
  } catch (error) {
    console.error(`Error: ${error.message}`)
  }
}

if (process.env.GEMNINI_API_KEY) {
  helloGemini()
}

if (process.env.OPENAI_API_KEY) {
  helloOpenAI()
}
