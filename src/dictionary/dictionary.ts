import got from 'got';

export interface Word {
  word: string;
  phonetics: {
    test: string,
    audio: string
  }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example: string;
    }[]
  }[];
}

export const search = async (word: string): Promise<Word[]> => {
  try {
    const response = await got(`https://api.dictionaryapi.dev/api/v2/entries/en_US/${word}`, { responseType: 'json' });
    const words = response.body as Word[];
    return words;
  } catch (e) {
    console.error(`Error searching for definition of  ${word}`);
    console.error(e);
    return [];
  }
};
