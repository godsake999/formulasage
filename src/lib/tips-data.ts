
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

export type Tip = {
  id: number;
  created_at?: string;
  title: LanguageData;
  oldMethodTitle: LanguageData;
  oldMethodDesc: LanguageDataArray;
  newMethodTitle: LanguageData;
  newMethodDesc: LanguageDataArray;
  details: LanguageDataArray;
  exampleCode: string;
  visualExplanation?: VisualExplanation;
};
