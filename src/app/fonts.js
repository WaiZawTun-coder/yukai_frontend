import localFont from "next/font/local";

export const subjectitvity = localFont({
  src: [
    {
      path: "../../public/fonts/subjectivity/Subjectivity-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/subjectivity/Subjectivity-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-subjecitvity",
  display: "swap",
});
