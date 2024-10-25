'use strict'

// Load environment variables from .env file
import 'dotenv/config'

// Import input and printing tools
import { marked } from 'marked'
import { markedTerminal } from 'marked-terminal'
import { bgYellow, cyan } from 'colorette'
import { input } from '@inquirer/prompts'

// Langchain and LangGraph imports
import { WikipediaQueryRun } from '@langchain/community/tools/wikipedia_query_run'
import { DuckDuckGoSearch } from '@langchain/community/tools/duckduckgo_search'
import { ChatOpenAI } from '@langchain/openai'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { HumanMessage } from '@langchain/core/messages'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { MemorySaver } from '@langchain/langgraph'

// Use marked with terminal support
marked.use(markedTerminal())

// Define the tools the agent can use
// In this case, it's Wikipedia and DuckDuckGo tools
const agentTools = [
  new WikipediaQueryRun({
    baseUrl: 'https://es.wikipedia.org/w/api.php'
  }),
  new DuckDuckGoSearch({
    searchOptions: {
      locale: 'es-ES',
      marketRegion: 'co-es'
    }
  })
]

// Initialize the language model
const llm = process.env.OPENAI_API_KEY
  ? new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0
  })
  : new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-flash',
    temperature: 0
  })

// Initialize memory to persist state between graph runs
const agentCheckpointer = new MemorySaver()

// Create the agent using the createReactAgent function
const agent = createReactAgent({
  llm,
  tools: agentTools,
  checkpointSaver: agentCheckpointer
})

// Print the welcome message
console.log(
  bgYellow('Agente Web AI:'),
  '¡Hola! Soy un tu asistente de búsqueda en internet y especialista en wikipedia.\n'
)

// Function to handle user's input
async function handleInput () {
  try {
    // Get user's input
    const userInput = await input({ message: '>>> ' })

    // Invoke the agent with a user's prompt
    const agentFinalState = await agent.invoke(
      { messages: [new HumanMessage(userInput)] },
      { configurable: { thread_id: 'agente-wikipedia' } }
    )

    const response = agentFinalState.messages[agentFinalState.messages.length - 1].content

    // Print the response
    console.log(bgYellow('\nAgente Web AI:'))
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
