export interface QueryLocalFontsFont {
  family: string;
  fullName: string;
  postscriptName: string;
  style: string;
  blob: () => Promise<Blob>;
}

export interface GoogleFont {
  family: string;
  styles?: string[];
  weights?: number[];
}

export interface FallbackFont {
  family: string;
}

export interface FontItem {
  family: string;
  style: string;
}
