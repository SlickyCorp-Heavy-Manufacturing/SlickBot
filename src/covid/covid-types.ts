export interface UsDaily {
    date: string;
    states: number,
    positive: number,
    negative: number,
    pending: number,
    hospitalizedCurrently: number,
    hospitalizedCumulative: number,
    inIcuCurrently: number,
    inIcuCumulative: number,
    onVentilatorCurrently: number,
    onVentilatorCumulative: number,
    recovered: number,
    dateChecked: string,
    death: number
    hospitalized: number
    lastModified: string,
    total: number
    totalTestResults: number
    posNeg: number
    deathIncrease: number
    hospitalizedIncrease: number
    negativeIncrease: number
    positiveIncrease: number
    totalTestResultsIncrease: number
    hash: string
}

export interface DHSData {
    displayFieldName: string;
    fieldAliases: DHSDataAlias
    fields: DHSDataFieldsArray;
    features: DHSDataCountyArray;
}

export interface DHSDataAlias {
    NAME: string;
    DATE: string;
    POSITIVE: string;
    POS_NEW: string;
    NEGATIVE: string;
    NEG_NEW: string;
    DEATHS: string;
    DTH_NEW: string;
    TEST_NEW: string;
    GEO: string
}

export interface DHSDataFieldsArray extends Array<DHSDataField> {}

export interface DHSDataField {
    name: string;
    type: string;
    alias: string;
    length: number;
}

export interface DHSDataCountyArray extends Array<DHSDataCounty> {}

export interface DHSDataCounty {
    attributes: DHSDataCountyAttributes;
}

export interface DHSDataCountyAttributes {
    "NAME": string;
    "DATE": number;
    "POSITIVE": number;
    "POS_NEW": number;
    "NEGATIVE": number;
    "NEG_NEW": number;
    "DEATHS": number;
    "DTH_NEW": number;
    "TEST_NEW": number;
    "GEO": string;
}