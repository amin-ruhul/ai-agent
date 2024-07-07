import { FunctionsAgentAction } from "langchain/agents/openai/output_parser";
import { AIMessage } from "@langchain/core/messages";
import { AgentFinish } from "langchain/agents";

const structuredOutputParser = (
  message: AIMessage
): FunctionsAgentAction | AgentFinish => {
  if (message.content && typeof message.content !== "string") {
    throw new Error("This agent cannot parse non-string model responses.");
  }
  if (message.additional_kwargs.function_call) {
    const { function_call } = message.additional_kwargs;
    try {
      const toolInput = function_call.arguments
        ? JSON.parse(function_call.arguments)
        : {};
      // If the function call name is `response` then we know it's used our final
      // response function and can return an instance of `AgentFinish`
      if (function_call.name === "response") {
        return { returnValues: { ...toolInput }, log: message.content };
      }
      return {
        tool: function_call.name,
        toolInput,
        log: `Invoking "${function_call.name}" with ${
          function_call.arguments ?? "{}"
        }\n${message.content}`,
        messageLog: [message],
      };
    } catch (error) {
      throw new Error(
        `Failed to parse function arguments from chat model response. Text: "${function_call.arguments}". ${error}`
      );
    }
  } else {
    return {
      returnValues: { output: message.content },
      log: message.content,
    };
  }
};

export { structuredOutputParser };
