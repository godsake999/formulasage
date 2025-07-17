
'use client';

import React, from 'react';

export type Language = 'en' | 'my';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const LanguageContext = React.createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = React.useState<Language>('en');

  React.useEffect(() => {
    // You can add logic here to persist language preference, e.g., in localStorage
    const storedLang = localStorage.getItem('language') as Language | null;
    if (storedLang) {
      setLanguage(storedLang);
    }
  }, []);
  
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const content = {
    en: {
      nav: {
        home: 'Home',
        functions: 'Functions',
        categories: 'Categories',
        builder: 'Builder',
        tips: 'Tips & Tricks',
        admin: 'Admin',
        login: 'Login',
        logout: 'Logout',
      },
      common: {
        zoom: "Zoom Image",
        searchPlaceholder: "Search functions...",
      },
      home: {
        title: 'Master Excel Functions',
        subtitle: 'Discover powerful Excel functions and formulas to boost your productivity and data analysis skills.',
        featuredFunctions: 'Featured Functions',
        viewAll: 'View All',
        platformOverview: "Platform Overview",
        platformOverviewSubtitle: "A comprehensive repository of Excel knowledge.",
        totalFunctions: "Total Functions",
        uniqueCategories: "Unique Categories",
        expertTips: "Expert Tips",
        newAdditions: "New Additions Weekly",
        functionCategories: "Function Categories",
        quickAccess: "Quick Access",
        quickAccessSubtitle: "Find what you need, faster.",
        popular: "Popular",
        recent: "Recent",
        bookmarked: "Bookmarked",
        comingSoon: "This feature is coming soon!",
        noFormulas: 'No formulas found. Please add some in the admin panel.',
        loginToViewBookmarks: "Login to View Bookmarks",
        loginToViewBookmarksSubtitle: "Create an account to save your favorite formulas for quick access.",
        noBookmarks: "No Bookmarks Yet",
        noBookmarksSubtitle: "Click the bookmark icon on a formula page to save it here.",
      },
      allFormulas: {
        title: 'All Functions',
        subtitle: 'Browse and search our entire collection of Excel functions.',
        searchPlaceholder: "Search for functions (e.g., 'XLOOKUP', 'SUMIFS')",
        noResults: (term: string) => `No functions found for "${term}".`,
      },
      tipsPage: {
        title: 'Productivity Tips',
        subtitle: 'Upgrade your workflow with these powerful Excel tips.',
        details: 'Details',
        example: 'Example',
        visualExplanation: 'Visual Explanation',
        noTips: 'No tips found. Please check back later!',
        searchPlaceholder: "Search for tips (e.g., 'XLOOKUP', 'Pivot Table')",
        noResults: (term: string) => `No tips found for "${term}".`,
      },
      category: {
        title: 'Browse by Category',
        subtitle: 'Explore functions based on their category or difficulty level.',
        allCategories: 'All Categories',
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced",
        backToCategories: "Back to Categories",
        categorySubtitle: (category: string) => `A collection of functions and tips for the ${category} category.`
      },
      formulaCard: {
        syntax: 'Syntax',
        viewDetails: 'View Details & Example',
        example: 'Example',
        visualExplanation: 'Visual Explanation',
        learnMore: 'Learn More'
      },
      admin: {
          title: "Admin Panel",
          subtitle: "Manage the Excel formulas and tips displayed on the site.",
          loginRequired: "Login Required",
          loginPrompt: "You must be logged in as an administrator to access this page.",
          notAdmin: "Access Denied",
          notAdminPrompt: "You do not have permission to view this page.",
          
          formulasTitle: "Existing Formulas",
          tipsTitle: "Existing Tips",

          edit: "Edit",
          delete: "Delete",
          clearForm: "Clear form to add new",
          idLabel: "ID",
          
          isNewLabel: "Mark as New",
          difficultyLabel: "Difficulty Level",
          difficultyEnLabel: "Difficulty (English)",
          difficultyMyLabel: "Difficulty (Myanmar)",
          beginner: "Beginner",
          intermediate: "Intermediate",
          advanced: "Advanced",


          // Formula Form
          addFormTitle: "Add Formula",
          editFormTitle: "Edit Formula",
          titleEnLabel: "Title (English)",
          titleMyLabel: "Title (Myanmar)",
          categoryEnLabel: "Category (English)",
          categoryMyLabel: "Category (Myanmar)",
          shortDescEnLabel: "Short Description (English)",
          shortDescMyLabel: "Short Description (Myanmar)",
          longDescEnLabel: "Long Description (English - one paragraph per line)",
          longDescMyLabel: "Long Description (Myanmar - one paragraph per line)",
          syntaxLabel: "Syntax",
          syntaxPlaceholder: "=XLOOKUP(lookup_value, lookup_array, return_array, ...)",
          exampleLabel: "Example",
          examplePlaceholder: "=XLOOKUP(E2, A2:A10, C2:C10)",
          exampleExpEnLabel: "Example Explanation (English)",
          exampleExpMyLabel: "Example Explanation (Myanmar)",
          addButton: "Add Formula",
          updateButton: "Update Formula",

          // Tip Form
          addTipTitle: "Add Tip",
          editTipTitle: "Edit Tip",
          tipTitleEnLabel: "Tip Title (English)",
          tipTitleMyLabel: "Tip Title (Myanmar)",
          oldMethodTitleEnLabel: "Old Method Title (English)",
          oldMethodTitleMyLabel: "Old Method Title (Myanmar)",
          oldMethodDescEnLabel: "Old Method Description (English - one item per line)",
          oldMethodDescMyLabel: "Old Method Description (Myanmar - one item per line)",
          newMethodTitleEnLabel: "New Method Title (English)",
          newMethodTitleMyLabel: "New Method Title (Myanmar)",
          newMethodDescEnLabel: "New Method Description (English - one item per line)",
          newMethodDescMyLabel: "New Method Description (Myanmar - one item per line)",
          detailsEnLabel: "Details (English - one paragraph per line)",
          detailsMyLabel: "Details (Myanmar - one paragraph per line)",
      },
      login: {
        title: "Admin Login",
        emailLabel: "Email",
        passwordLabel: "Password",
        button: "Login",
        errorTitle: "Login Failed",
      },
      builder: {
        title: "Formula Builder",
        subtitle: "Build complex Excel formulas with our intuitive drag-and-drop interface",
        savedFormulas: "Saved Formulas",
        reset: "Reset",
        libraryTitle: "Function Library",
        searchPlaceholder: "Search functions...",
        builderTitle: "Formula Builder",
        clear: "Clear",
        dropTargetTitle: "Drop functions here to build your formula",
        dropTargetSubtitle: "Drag from the function library on the left",
        previewTitle: "Formula Preview",
        generatedFormula: "Generated Formula",
        generatedFormulaPlaceholder: "Add functions to generate formula...",
        sampleData: "Sample Data",
        resultTitle: "AI-Powered Result",
        resultSubtitle: "Result calculated by AI based on sample data",
        apiKeyLabel: "Gemini API Key",
        apiKeyPlaceholder: "Enter your API key here",
        calculateButton: "Calculate",
      }
    },
    my: {
      nav: {
        home: 'ပင်မ',
        functions: 'ဖန်ရှင်များ',
        categories: 'အမျိုးအစားများ',
        builder: 'ဖော်မြူလာတည်ဆောက်သူ',
        tips: 'အကြံပြုချက်များ',
        admin: 'အက်မင်',
        login: 'ဝင်ရန်',
        logout: 'ထွက်ရန်',
      },
       common: {
        zoom: "ပုံကိုချဲ့ကြည့်ရန်",
        searchPlaceholder: "ဖန်ရှင်များရှာရန်...",
      },
      home: {
        title: 'Excel ဖန်ရှင်များကို ကျွမ်းကျင်ပိုင်နိုင်စွာအသုံးပြုပါ',
        subtitle: 'သင်၏ကုန်ထုတ်စွမ်းအားနှင့် ဒေတာခွဲခြမ်းစိတ်ဖြာခြင်းစွမ်းရည်ကို မြှင့်တင်ရန် အစွမ်းထက်သော Excel ဖန်ရှင်များနှင့် ဖော်မြူလာများကို ရှာဖွေပါ။',
        featuredFunctions: 'အထူးပြုဖန်ရှင်များ',
        viewAll: 'အားလုံးကြည့်ရန်',
        platformOverview: "ခြုံငုံသုံးသပ်ချက်",
        platformOverviewSubtitle: "Excel အသိပညာ ပြည့်စုံသော Repsitory",
        totalFunctions: "ဖန်ရှင် စုစုပေါင်း",
        uniqueCategories: "အမျိုးအစားများ",
        expertTips: "ကျွမ်းကျင်သူ အကြံပြုချက်များ",
        newAdditions: "အပတ်စဥ် အသစ်ထပ်တိုးမှုများ",
        functionCategories: "ဖန်ရှင် အမျိုးအစားများ",
        quickAccess: "အမြန်ဝင်ရောက်ရန်",
        quickAccessSubtitle: "သင်လိုအပ်သောအရာကို ပိုမိုမြန်ဆန်စွာရှာဖွေပါ။",
        popular: "လူကြိုက်များ",
        recent: "မကြာမီက",
        bookmarked: "မှတ်သားထားသည်",
        comingSoon: "ဤအင်္ဂါရပ်သည် မကြာမီလာမည်!",
        noFormulas: 'ဖော်မြူလာများမတွေ့ပါ။ အက်မင် စီမံခန့်ခွဲမှုတွင် ထည့်သွင်းပေးပါ။',
        loginToViewBookmarks: "မှတ်သားထားသည်များကိုကြည့်ရန် လော့ဂ်အင်ဝင်ပါ",
        loginToViewBookmarksSubtitle: "အကြိုက်ဆုံးဖော်မြူလာများကိုသိမ်းဆည်းရန် အကောင့်တစ်ခုဖွင့်ပါ။",
        noBookmarks: "မှတ်သားထားသည်များ မရှိသေးပါ",
        noBookmarksSubtitle: "ဤနေရာတွင်သိမ်းဆည်းရန် ဖော်မြူလာစာမျက်နှာရှိ bookmark အိုင်ကွန်ကိုနှိပ်ပါ။",
      },
      allFormulas: {
        title: 'ဖန်ရှင်များအားလုံး',
        subtitle: 'ကျွန်ုပ်တို့၏ Excel ဖန်ရှင်များအားလုံးကို ကြည့်ရှုပြီး ရှာဖွေပါ။',
        searchPlaceholder: "ဖန်ရှင်များရှာရန် (ဥပမာ 'XLOOKUP')",
        noResults: (term: string) => `"${term}" အတွက် ဖန်ရှင်များမတွေ့ပါ။`,
      },
      tipsPage: {
        title: 'ကုန်ထုတ်စွမ်းအား အကြံပြုချက်များ',
        subtitle: 'သင်၏ လုပ်ငန်းစဥ်ကို ဤအစွမ်းထက်သော Excel အကြံပြုချက်များဖြင့် အဆင့်မြှင့်ပါ။',
        details: 'အသေးစိတ်',
        example: 'ဥပမာ',
        visualExplanation: 'မြင်သာသော ရှင်းလင်းချက်',
        noTips: 'အကြံပြုချက်များ မတွေ့ပါ။ နောက်မှပြန်ကြည့်ပေးပါ။',
        searchPlaceholder: "အကြံပြုချက်များရှာရန် (ဥပမာ 'XLOOKUP', 'Pivot Table')",
        noResults: (term: string) => `"${term}" အတွက် အကြံပြုချက်များမတွေ့ပါ။`,
      },
      category: {
        title: 'အမျိုးအစားအလိုက် ကြည့်ရှုရန်',
        subtitle: 'ဖန်ရှင်များကို ၎င်းတို့၏ အမျိုးအစား သို့မဟုတ် အခက်အခဲအဆင့်အလိုက် ရှာဖွေပါ။',
        allCategories: 'အမျိုးအစားအားလုံး',
        beginner: "လွယ်ကူသော",
        intermediate: "အလယ်အလတ်",
        advanced: "ခက်ခဲသော",
        backToCategories: "အမျိုးအစားများသို့ ပြန်သွားရန်",
        categorySubtitle: (category: string) => `${category} အမျိုးအစားအတွက် ဖန်ရှင်များနှင့် အကြံပြုချက်များ။`
      },
      formulaCard: {
        syntax: 'ရေးထုံး',
        viewDetails: 'အသေးစိတ်နှင့် ဥပမာကြည့်ရန်',
        example: 'ဥပမာ',
        visualExplanation: 'မြင်သာသော ရှင်းလင်းချက်',
        learnMore: 'ဆက်လက်လေ့လာရန်'
      },
      admin: {
          title: "အက်မင် စီမံခန့်ခွဲမှု",
          subtitle: "ဆိုက်ပေါ်ရှိ Excel ဖော်မြူလာများနှင့် အကြံပြုချက်များကို စီမံပါ။",
          loginRequired: "လော့ဂ်အင်လုပ်ရန်လိုအပ်သည်",
          loginPrompt: "ဤစာမျက်နှာကိုဝင်ရောက်ရန် အက်မင်အဖြစ် လော့ဂ်အင်ဝင်ရပါမည်။",
          notAdmin: "ဝင်ရောက်ခွင့်မရှိပါ",
          notAdminPrompt: "သင့်တွင် ဤစာမျက်နှာကိုကြည့်ရှုခွင့်မရှိပါ။",
          
          formulasTitle: "ရှိပြီးသား ဖော်မြူလာများ",
          tipsTitle: "ရှိပြီးသား အကြံပြုချက်များ",

          edit: "ပြင်ရန်",
          delete: "ဖျက်ရန်",
          clearForm: "အသစ်ထည့်ရန် ဖောင်ကိုရှင်းလင်းပါ",
          idLabel: "အိုင်ဒီ",
          isNewLabel: "အသစ်အဖြစ် အမှတ်အသားပြုပါ",
          difficultyLabel: "အခက်အခဲ အဆင့်",
          difficultyEnLabel: "Difficulty (English)",
          difficultyMyLabel: "Difficulty (Myanmar)",
          beginner: "လွယ်ကူသော",
          intermediate: "အလယ်အလတ်",
          advanced: "ခက်ခဲသော",

          // Formula Form
          addFormTitle: "ဖော်မြူလာ ထည့်ရန်",
          editFormTitle: "ဖော်မြူလာ ပြင်ရန်",
          titleEnLabel: "ခေါင်းစဉ် (အင်္ဂလိပ်)",
          titleMyLabel: "ခေါင်းစဉ် (မြန်မာ)",
          categoryEnLabel: "အမျိုးအစား (အင်္ဂလိပ်)",
          categoryMyLabel: "အမျိုးအစား (မြန်မာ)",
          shortDescEnLabel: "အကျဉ်းချုပ် ဖော်ပြချက် (အင်္ဂလိပ်)",
          shortDescMyLabel: "အကျဉ်းချုပ် ဖော်ပြချက် (မြန်မာ)",
          longDescEnLabel: "အသေးစိတ် ဖော်ပြချက် (အင်္ဂလိပ် - တစ်ကြောင်းလျှင် စာပိုဒ်တစ်ပိုဒ်)",
          longDescMyLabel: "အသေးစိတ် ဖော်ပြချက် (မြန်မာ - တစ်ကြောင်းလျှင် စာပိုဒ်တစ်ပိုဒ်)",
          syntaxLabel: "ရေးထုံး",
          syntaxPlaceholder: "=XLOOKUP(lookup_value, lookup_array, return_array, ...)",
          exampleLabel: "ဥပမာ",
          examplePlaceholder: "=XLOOKUP(E2, A2:A10, C2:C10)",
          exampleExpEnLabel: "ဥပမာ ရှင်းလင်းချက် (အင်္ဂလိပ်)",
          exampleExpMyLabel: "ဥပမာ ရှင်းလင်းချက် (မြန်မာ)",
          addButton: "ဖော်မြူလာထည့်ပါ",
          updateButton: "ဖော်မြူလာပြင်ဆင်ပါ",
      },
      login: {
        title: "အက်မင် လော့ဂ်အင်",
        emailLabel: "အီးမေးလ်",
        passwordLabel: "စကားဝှက်",
        button: "ဝင်ရန်",
        errorTitle: "လော့ဂ်အင် မအောင်မြင်ပါ",
      },
       builder: {
        title: "ဖော်မြူလာ တည်ဆောက်သူ",
        subtitle: "ကျွန်ုပ်တို့၏ drag-and-drop interface ဖြင့် ရှုပ်ထွေးသော Excel ဖော်မြူလာများကို တည်ဆောက်ပါ။",
        savedFormulas: "သိမ်းဆည်းထားသော ဖော်မြူလာများ",
        reset: "ပြန်လည်စတင်ရန်",
        libraryTitle: "ဖန်ရှင် စာကြည့်တိုက်",
        searchPlaceholder: "ဖန်ရှင်များရှာရန်...",
        builderTitle: "ဖော်မြူလာ တည်ဆောက်သူ",
        clear: "ရှင်းလင်းရန်",
        dropTargetTitle: "သင်၏ဖော်မြူလာကိုတည်ဆောက်ရန် ဤနေရာတွင် ဖန်ရှင်များကိုချပါ",
        dropTargetSubtitle: "ဘယ်ဘက်ရှိ ဖန်ရှင်စာကြည့်တိုက်မှ ဆွဲယူပါ",
        previewTitle: "ဖော်မြူလာ အစမ်းကြည့်ရှုခြင်း",
        generatedFormula: "ထုတ်လုပ်ထားသော ဖော်မြူလာ",
        generatedFormulaPlaceholder: "ဖော်မြူလာထုတ်လုပ်ရန် ဖန်ရှင်များထည့်ပါ...",
        sampleData: "နမူနာ ဒေတာ",
        resultTitle: "AI ဖြင့်ရရှိသော ရလဒ်",
        resultSubtitle: "နမူနာဒေတာအပေါ် AI မှ တွက်ချက်ထားသော ရလဒ်",
        apiKeyLabel: "Gemini API Key",
        apiKeyPlaceholder: "သင်၏ API key ကို ဤနေရာတွင် ထည့်ပါ",
        calculateButton: "တွက်ချက်ပါ",
      }
    },
  };
