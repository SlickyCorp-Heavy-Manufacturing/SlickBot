declare module 'moji-translate' {
  const translate: {
    translate(text: string, shouldTranslateToEmoji: boolean): string;
  };
  export default translate;
}