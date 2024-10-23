'use strict'

// Load environment variables from .env file
import 'dotenv/config'

// Import input and printing tools
import { marked } from 'marked'
import { markedTerminal } from 'marked-terminal'
import { bgYellow, cyan } from 'colorette'
import { input } from '@inquirer/prompts'

// Import Langchain Chat interfaces and tools
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents'

// Use marked with terminal support
marked.use(markedTerminal())

// Creating a new instance for OpenAI Chat or Google Generative AI Chat
const llm = process.env.OPENAI_API_KE
  ? new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0
  })
  : new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-flash',
    temperature: 0
  })

// Load the content from the CityJS Medellin website
const loader = new CheerioWebBaseLoader('https://medellin.cityjsconf.org/', {
  selector: 'p, span, h1, h2, h3, h4, h5, h6, a'
})

// Create docs from the content
const docs = await loader.load()

// Split the docs into chunks in preparation for vectorization
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200
})
const splits = await textSplitter.splitDocuments(docs)

// Create a vector store from the splits
const vectorstore = await MemoryVectorStore.fromDocuments(
  splits,
  process.env.OPENAI_API_KE ? new OpenAIEmbeddings() : new GoogleGenerativeAIEmbeddings()
)

// Create a retrieval chain
const retriever = vectorstore.asRetriever()

// Print the welcome message
console.log(
  bgYellow('Tutor de JavaScript:'),
  '¡Hola! Soy parte del staff de CityJS Medellin y doy información básica de la conferencia, adicional puedo resolver dudas de JavaScript.\n'
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
        'Usted es un organizador de la conferencia CityJS Medellin y también tutor de JavaScript,' +
        'no puede hablar de otro tema que no sea  dar información de la conferencia o enseñar JavaScript.' +
        'Responda a las preguntas de la conferencia con este contexto:\n\n{context}'
      ],
      ['human', '{input}']
    ])

    // Create a chain for answering questions
    const ragChain = await createStuffDocumentsChain({
      llm,
      prompt,
      outputParser: new StringOutputParser()
    })

    // Retrieve the documents that are most relevant to the user's input
    const retrievedDocs = await retriever.invoke(userInput)

    // Get the final response from the chain
    const response = await ragChain.invoke({
      input: userInput,
      context: retrievedDocs
    })

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
