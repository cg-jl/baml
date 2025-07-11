class FinalResponseTool {
  action "final_response" @description("Provide a final response when all information is gathered and no more tools are needed.")
  follow_up_questions string[]
  response string
}

function TestFinalResponseTool(input: string) -> FinalResponseTool {
  client "openai/gpt-4o-mini"
  prompt #"
    Generate a response with follow up questions.
    Input: {{ input }}
    
    {{ ctx.output_format }}
  "#
}

test TestFinalResponseTool {
    functions [TestFinalResponseTool]
    args {
        input "Tell me about TypeScript"
    }
}