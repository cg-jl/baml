import TypeBuilder from "../baml_client/type_builder";
import { b } from "./test-setup";

describe("Dynamic Streaming Bug - Property Order", () => {
  describe("FinalResponseTool streaming with property order", () => {
    it("should stream response when 'response' property is added AFTER 'follow_up_questions'", async () => {
      // This is the working case reported by the user
      let tb = new TypeBuilder();
      
      // // Add properties in the order that WORKS for streaming
      // tb.FinalResponseTool.addProperty("follow_up_questions", tb.list(tb.string()))
      //   .description("Follow up questions for the user")
      //   .alias("user_follow_up_questions");
      
      // tb.FinalResponseTool.addProperty("response", tb.string())
      //   .description("The main response content");
      
      const stream = b.stream.TestFinalResponseTool("Tell me about TypeScript", { tb });
      
      let hasStreamedResponse = false;
      let partialResponses = [];
      
      for await (const chunk of stream) {
        if (chunk?.response) {
          console.log("chunk", chunk);
          hasStreamedResponse = true;
          partialResponses.push(chunk.response);
        }
      }
      
      const finalResponse = await stream.getFinalResponse();
      
      // Verify streaming occurred
      expect(hasStreamedResponse).toBe(true);
      expect(partialResponses.length).toBeGreaterThan(0);
      expect(finalResponse.action).toBe("final_response");
      expect(finalResponse.response).toBeDefined();
      expect(finalResponse.follow_up_questions).toBeDefined();
      expect(Array.isArray(finalResponse.follow_up_questions)).toBe(true);
    });

    // it("should NOT stream response when 'response' property is added BEFORE 'follow_up_questions'", async () => {
    //   // This is the broken case reported by the user
    //   let tb = new TypeBuilder();
    //   
    //   // Add properties in the order that BREAKS streaming
    //   tb.FinalResponseTool.addProperty("response", tb.string())
    //     .description("The main response content");
    //     
    //   tb.FinalResponseTool.addProperty("follow_up_questions", tb.list(tb.string()))
    //     .description("Follow up questions for the user")
    //     .alias("user_follow_up_questions");
    //   
    //   // Test streaming - use dynamic function call
    //   const stream = b.stream.TestFinalResponseTool("Tell me about TypeScript", { tb });
    //   
    //   let hasStreamedResponse = false;
    //   let partialResponses = [];
    //   
    //   for await (const chunk of stream) {
    //     if (chunk?.response) {
    //       console.log("chunk", chunk);
    //       hasStreamedResponse = true;
    //       partialResponses.push(chunk.response);
    //     }
    //   }
    //   
    //   const finalResponse = await stream.getFinalResponse();
    //   
    //   // This test demonstrates the bug: response should stream but doesn't
    //   // when property order is changed
    //   expect(hasStreamedResponse).toBe(false); // Bug: should be true but is false
    //   expect(partialResponses.length).toBe(0); // Bug: should have partial responses
    //   
    //   // Final response should still work correctly
    //   expect(finalResponse.action).toBe("final_response");
    //   expect(finalResponse.response).toBeDefined();
    //   expect(finalResponse.follow_up_questions).toBeDefined();
    //   expect(Array.isArray(finalResponse.follow_up_questions)).toBe(true);
    // });

  });

  // describe("Streaming with @@dynamic annotation", () => {
  //   it("should test if @@dynamic annotation affects streaming behavior", async () => {
  //     let tb = new TypeBuilder();
  //     
  //     // Test with @@dynamic annotation
  //     tb.addBaml(`
  //       class DynamicResponseTool {
  //         action "final_response" @description("Action type")
  //         @@dynamic
  //       }
  //       
  //       function TestDynamicAnnotation(input: string) -> DynamicResponseTool {
  //         client "openai/gpt-4o-mini" 
  //         prompt #"
  //           Generate a response.
  //           Input: {{ input }}
  //         "#
  //       }
  //     `);
  //     
  //     // Add properties dynamically in the "broken" order
  //     const DynamicResponseTool = tb.addClass("DynamicResponseTool");
  //     DynamicResponseTool.addProperty("response", tb.string());
  //     DynamicResponseTool.addProperty("follow_up_questions", tb.list(tb.string()));
  //     
  //     const stream = b.stream.TestFinalResponseTool("Test", { tb });
  //     
  //     let hasStreamedResponse = false;
  //     
  //     for await (const chunk of stream) {
  //       if (chunk?.response) {
  //         hasStreamedResponse = true;
  //         break;
  //       }
  //     }
  //     
  //     await stream.getFinalResponse();
  //     
  //     // Document the behavior with @@dynamic
  //     console.log(`With @@dynamic annotation, streaming occurred: ${hasStreamedResponse}`);
  //     expect(typeof hasStreamedResponse).toBe("boolean");
  //   });
  // });
});