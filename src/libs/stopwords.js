// Listes de mots vides (stop words) pour le français et l'anglais,
// plus une détection de langue heuristique basée sur leur fréquence.

const FR = `au aux avec ce ces dans de des du elle en et eux il je la le les leur
lui ma mais me même mes moi mon ne nos notre nous on ou où par pas pour qu que
qui sa se ses son sur ta te tes toi ton tu un une vos votre vous c d j l à m n s
t y été étée étées étés étant suis es est sommes êtes sont serai seras sera
serons serez seront serais serait serions seriez seraient étais était étions
étiez étaient fus fut fûmes fûtes furent sois soit soyons soyez soient fusse
fusses fût ai as avons avez ont aurai auras aura aurons aurez auront aurais
aurait aurions auriez auraient avais avait avions aviez avaient eu eus eut eûmes
eûtes eurent aie aies ait ayons ayez aient eusse eusses eût étant ayant donc
car ni quel quelle quels quelles sans sous ces cela celui ici là leurs si
plus moins très trop déjà alors aussi entre vers chez tout toute tous toutes
autre autres certains certaines chaque encore enfin ainsi non oui dont quand`;

const EN = `a an the and or but if then else when at by for with about against
between into through during before after above below to from up down in out on
off over under again further once is am are was were be been being have has had
having do does did doing of as i you he she it we they me him her us them my
your his its our their this that these those there here what which who whom whose
not no nor so than too very can will just should now`;

function toSet(blob) {
  return new Set(blob.split(/\s+/).map((w) => w.trim()).filter(Boolean));
}

export const STOPWORDS = {
  fr: toSet(FR),
  en: toSet(EN),
};

export function isStopword(word, lang) {
  return STOPWORDS[lang]?.has(word.toLowerCase()) ?? false;
}

// Devine la langue dominante en comptant les mots vides rencontrés.
export function detectLanguage(tokens) {
  let fr = 0;
  let en = 0;
  for (const token of tokens) {
    if (STOPWORDS.fr.has(token)) fr++;
    if (STOPWORDS.en.has(token)) en++;
  }
  if (fr === 0 && en === 0) return "fr";
  return fr >= en ? "fr" : "en";
}
