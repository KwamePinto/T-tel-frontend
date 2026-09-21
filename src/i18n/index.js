import { useCallback, useSyncExternalStore } from "react";
import fr from "./fr";
import { DEFAULT_LANG, getLang, getVersion, subscribe } from "./store";

export { LANGS, DEFAULT_LANG, getLang, setLang, subscribe, getVersion } from "./store";

const DICTIONARIES = { fr };

/**
 * Translates one of the site's own strings. Anything unknown stays as it is.
 *
 * Exported as `t` for use directly in markup. It reads the current language at
 * call time rather than through a hook, which keeps the change to each
 * component down to one import — what makes it correct is that Layout
 * subscribes to the language, so a switch re-renders the tree beneath it and
 * every one of these calls runs again.
 */
export function translate(text, lang = getLang()) {
  if (lang === DEFAULT_LANG || typeof text !== "string") return text;
  return DICTIONARIES[lang]?.[text] ?? text;
}

/**
 * `const t = useT()` — then `t("Read more")`.
 *
 * Keyed by the English string, so a component still reads as what it renders
 * and an untranslated string degrades to English rather than to a missing key.
 */
export { translate as t };

export function useT() {
  const lang = useLang();
  return useCallback((text) => translate(text, lang), [lang]);
}

/** The current language code, re-rendering the caller when it changes. */
export function useLang() {
  return useSyncExternalStore(subscribe, getLang, () => DEFAULT_LANG);
}

/**
 * A counter that changes on every language switch.
 *
 * useCms folds this into its dependencies, which is what makes every piece of
 * content on screen refetch in the new language without any of the forty-odd
 * call sites having to know that languages exist.
 */
export function useLangVersion() {
  return useSyncExternalStore(subscribe, getVersion, () => 0);
}
