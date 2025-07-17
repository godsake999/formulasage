'use server';

/**
 * @fileOverview A text translation AI agent.
 *
 * - translateText - A function that handles text translation.
 * - TranslateTextInput - The input type for the translateText function.
 */
import {ai as globalAi} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {genkit, z} from 'genkit';

const TranslateTextInputSchema = z.object({
  textToTranslate: z
    .array(z.string())
    .describe('An array of strings to translate.'),
  apiKey: z.string().describe('The Google AI Gemini API key.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
    translations: z.array(z.string()).describe("The translated strings, in the same order as the input.")
});

export async function translateText(
  input: TranslateTextInput
): Promise<string[]> {
  // Directly call the flow defined below
  const result = await translateTextFlow(input);
  return result.translations;
}

const translateTextFlow = globalAi.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input) => {
    const { apiKey, textToTranslate } = input;

    // Create a temporary Genkit instance with the user's API key
    const ai = genkit({
      plugins: [googleAI({ apiKey })],
    });

    const geminiPro = googleAI.model('gemini-2.0-flash');

    const prompt = ai.definePrompt({
        name: 'translateTextPrompt',
        input: { schema: z.object({ textToTranslateString: z.string() }) },
        output: { schema: TranslateTextOutputSchema },
        prompt: `Translate the following array of English text into Burmese (Myanmar).
The input is a JSON string representation of an array.
Return the result as a JSON object with a single key "translations" which contains an array of strings.
Each string in the "translations" array should be the translation of the corresponding input string.
Maintain the order and the number of elements. Do not add any extra explanations or formatting.

Input:
{{{textToTranslateString}}}

Output:
`,
      });

    try {
      const { output } = await prompt(
        { textToTranslateString: JSON.stringify(textToTranslate) },
        { model: geminiPro }
      );
      
      if (!output || !output.translations || !Array.isArray(output.translations) || output.translations.length !== input.textToTranslate.length) {
          throw new Error("Translation did not return the expected object format with a 'translations' array.");
      }
      
      return output;
    } catch (error) {
      console.error("Error during translation flow:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      // Check for common API key errors
      if (typeof errorMessage === 'string' && (errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY_INVALID'))) {
         throw new Error('Your Gemini API key is not valid. Please check it and try again.');
      }
      throw new Error(`Failed to translate text. Please check your API key and input. Details: ${errorMessage}`);
    }
  }
);
