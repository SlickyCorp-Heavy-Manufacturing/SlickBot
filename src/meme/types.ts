/* These types match what is epxted by the api, so allow non-camelcase members */
/* eslint camelcase: "off" */
export interface meme {
    id: string;
    name: string;
    box_count: number;
    url?: string;
    height?: number;
    width?: number;
}
