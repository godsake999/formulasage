
export type LanguageData = {
  en: string;
  my: string;
}

export type LanguageDataArray = {
  en: string[];
  my: string[];
}

export type VisualExplanation = {
  imageUrl: string;
};

export type TipExample = {
  code: string;
  explanation: LanguageData;
  visuals: VisualExplanation[];
};

export type Tip = {
  id: number;
  created_at: string;
  exampleCode: string;
  title: { en: string; my: string };
  oldMethodTitle: { en: string; my: string };
  oldMethodDesc: { en: string[]; my: string[] };
  newMethodTitle: { en: string; my: string };
  newMethodDesc: { en: string[]; my: string[] };
  details: { en: string[]; my: string[] };
  examples: any[];
  visualExplanation?: { imageUrl: string }; // <-- Add this line
  // (other fields)
};
