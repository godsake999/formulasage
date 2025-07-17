'use server';

/**
 * @fileOverview An AI flow to calculate an Excel-like formula.
 *
 * - calculateFormula - A function that calculates a formula based on provided data.
 * - CalculateFormulaInput - The input type for the calculateFormula function.
 */

import { ai as globalAi } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { genkit, z } from 'genkit';

const CalculateFormulaInputSchema = z.object({
  formula: z.string().describe('The Excel-like formula to calculate. e.g., "=SUM(A1:A5)"'),
  data: z.array(z.record(z.any())).describe('The data table as an array of JSON objects.'),
  apiKey: z.string().describe('The Google AI Gemini API key.'),
});

export type CalculateFormulaInput = z.infer<typeof CalculateFormulaInputSchema>;

const CalculateFormulaOutputSchema = z.object({
    result: z.string().describe("The calculated result of the formula. This should be a string representing the final value, an error like #VALUE!, or #N/A.")
});

export async function calculateFormula(
  input: CalculateFormulaInput
): Promise<string> {
  const result = await calculateFormulaFlow(input);
  return result.result;
}

const calculateFormulaFlow = globalAi.defineFlow(
  {
    name: 'calculateFormulaFlow',
    inputSchema: CalculateFormulaInputSchema,
    outputSchema: CalculateFormulaOutputSchema,
  },
  async (input) => {
    const { apiKey, formula, data } = input;

    // Create a temporary Genkit instance with the user's API key
    const ai = genkit({
      plugins: [googleAI({ apiKey })],
    });

    const geminiPro = googleAI.model('gemini-2.0-flash');

    const prompt = ai.definePrompt({
      name: 'calculateFormulaPrompt',
      input: { schema: z.object({ formula: z.string(), data: z.string() }) },
      output: { schema: CalculateFormulaOutputSchema },
      prompt: `You are an expert Excel formula engine. Your task is to calculate the result of the given formula based on the provided dataset.

        Rules:
        - The data is provided as a JSON string representing an array of objects. The keys are column letters (A, B, C...) and the values are the cell contents.
        - Cell references in the formula (e.g., A1, B2:B5) correspond to this data. "A1" is the "A" property of the first object in the array, "B2" is the "B" property of the second object, etc. (1-based indexing).
        - Interpret the formula and calculate the result just like Microsoft Excel would.
        - Return only the final result. Do not include explanations, apologies, or any extra text.
        - If the formula is invalid or results in an error, return the standard Excel error message (e.g., "#VALUE!", "#N/A", "#DIV/0!").
        - The output must be a JSON object with a single key "result" containing the string value of the calculation.

        DATASET:
        {{{data}}}

        FORMULA:
        {{{formula}}}

        OUTPUT:
        `,
    });

    try {
      const { output } = await prompt({
        formula,
        data: JSON.stringify(data),
      }, { model: geminiPro });

      if (!output || typeof output.result === 'undefined') {
        throw new Error("The AI did not return a result in the expected format.");
      }

      return output;
    } catch (error) {
      console.error("Error during formula calculation flow:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      if (errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY_INVALID')) {
        throw new Error('Your Gemini API key is not valid. Please check it and try again.');
      }
      throw new Error(`Failed to calculate formula. Details: ${errorMessage}`);
    }
  }
);
