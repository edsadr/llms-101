'use strict'

// Load environment variables from .env file
import 'dotenv/config'

// Import input and printing tools
import { marked } from 'marked'
import { markedTerminal } from 'marked-terminal'
import { bgYellow, cyan } from 'colorette'
import { input } from '@inquirer/prompts'

// Use marked with terminal support
marked.use(markedTerminal())

// @TODO: Implement Langchain and tools

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

    // @TODO: Implement AI response
    const response = `Voy a responder a tu pregunta sobre JavaScript: ${userInput}`

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
