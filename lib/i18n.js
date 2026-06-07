export const languages = [
  { code: 'en', name: 'English' },
  { code: 'am', name: 'Amharic' },
];

const en = {
  login: 'Login',
  signUp: 'Sign Up',
  dashboard: 'Dashboard',
  listings: 'Listings',
  logout: 'Logout',
  rigel: 'Rigel',
  toggleTheme: 'Toggle theme',
  // Add other English translations here
};

const am = {
  login: 'ግባ',
  signUp: 'ይመዝገቡ',
  dashboard: 'ዳሽቦርድ',
  listings: 'ዝርዝሮች',
  logout: 'ውጣ',
  rigel: 'Rigel',
  toggleTheme: 'ገጽታ ቀይር',
  // Add other Amharic translations here
};

export const getTranslation = (lang, key) => {
  if (lang === 'am') {
    return am[key] || key;
  } else {
    return en[key] || key;
  }
};