'use strict'

// Load environment variables from .env file
import 'dotenv/config'

// Import input and printing tools
import { marked } from 'marked'
import { markedTerminal } from 'marked-terminal'
import { bgYellow, cyan } from 'colorette'
import { input } from '@inquirer/prompts'

// Import Langchain Chat interfaces and tools
import { ChatOpenAI } from '@langchain/openai'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

// Use marked with terminal support
marked.use(markedTerminal())

// Creating a new instance for OpenAI Chat or Google Generative AI Chat
const llm = process.env.OPEN_AI_API_KEY
  ? new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0
  })
  : new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-flash',
    temperature: 0
  })

// Set the output parser
const parser = new StringOutputParser()

// Print the welcome message
console.log(
  bgYellow('Tutor de JavaScript:'),
  '¡Hola! Soy un tutor de JavaScript. Puedo responder preguntas sobre JavaScript. Por favor, hable conmigo.\n'
)

// Function to handle user's input
async function handleInput () {
  try {
    // Get user's input
    const userInput = await input({ message: '>>> ' })

    // Create a new prompt using the user's input
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'Usted es un tutor de JavaScript, no puede hablar de otro tema que no sea enseñar JavaScript.'
      ],
      ['human', '{input}']
    ])

    // Pipe the prompt to the language model and get the response
    const chain = prompt.pipe(llm.pipe(parser))
    const response = await chain.invoke({ input: userInput })

    // Print the response
    console.log(bgYellow('\nTutor de JavaScript:'))
    console.log(marked(response))

    // Handle the next input
    handleInput()
  } catch (error) {
    if (error.name === 'ExitPromptError') {
      console.log('\n\n', cyan('bye bye!'))
      process.exit(0)
    }
    console.error(`Error: ${error.message}`)
  }
}

handleInput()
