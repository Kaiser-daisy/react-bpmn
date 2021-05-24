import translations from './translations';

function CustomTranslate(tempalte, replacements = {}) {
  const translateTempalte = translations[tempalte] || tempalte;
  return translateTempalte.replace(/{([^}]+)}/g, (_, key) => {
    return replacements[key] || `{${key}}`;
  });
}

export default CustomTranslate;
