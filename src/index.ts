import * as dotenv from "dotenv";
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import {
  PromptTemplate,
  ChatMessagePromptTemplate,
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { createOpenAIFunctionsAgent, AgentExecutor } from "langchain/agents";
import readline from "readline";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { weatherSchema } from "./schema";

import { zodToJsonSchema } from "zod-to-json-schema";
import { RunnableSequence } from "@langchain/core/runnables";
import { convertToOpenAIFunction } from "@langchain/core/utils/function_calling";
import { formatToOpenAIFunctionMessages } from "langchain/agents/format_scratchpad";
import { structuredOutputParser } from "./output";
import { DynamicTool } from "@langchain/core/tools";

const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  model: "gpt-3.5-turbo",
  temperature: 0.7,
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "you are a helpful assistant"],
  ["system", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);

const searchTool = new TavilySearchResults();

const lengthCountTool = new DynamicTool({
  name: "get_length",
  description: "Return the length of the word",
  func: async (input) => {
    console.log(input, input.length);
    return input.length.toString();
  },
});

const responseOpenAIFunction = {
  name: "response",
  description: "Return the response to the user",
  parameters: zodToJsonSchema(weatherSchema),
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const tools: any[] = [searchTool, lengthCountTool];

const modelWithFunctions = llm.bind({
  functions: [
    convertToOpenAIFunction(searchTool),
    convertToOpenAIFunction(lengthCountTool),
    responseOpenAIFunction,
  ],
});

function main() {
  rl.question("user: ", async (input) => {
    if (input.toLowerCase() === "exit") {
      rl.close();
      return;
    }
    const agent = RunnableSequence.from([
      {
        input: (i) => i.input,
        agent_scratchpad: (i) => formatToOpenAIFunctionMessages(i.steps),
      },
      prompt,
      modelWithFunctions,
      structuredOutputParser,
    ]);

    const executor = AgentExecutor.fromAgentAndTools({
      agent,
      tools,
      returnIntermediateSteps: true,
    });

    const result = await executor.invoke({
      input,
    });

    console.log(JSON.stringify(result, null, 2));

    main();
  });
}

main();
