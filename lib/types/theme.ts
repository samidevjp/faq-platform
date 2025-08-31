export interface SiteTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  questionColor: string;
  answerColor: string;
  borderRadius: string;
  maxWidth: string;
}

export const defaultTheme: SiteTheme = {
  primaryColor: "#3b82f6",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  questionColor: "#111827",
  answerColor: "#4b5563",
  borderRadius: "0.5rem",
  maxWidth: "48rem",
};
