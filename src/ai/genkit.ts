import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This global `ai` instance is now used to define flows.
// Flows that require a user-provided API key will create their own
// temporary Genkit instance inside the flow definition itself.
export const ai = genkit({
  plugins: [googleAI()],
});
