import "./globals.css";

export const metadata = {
  title: "WaGo Enterprise",
  description:
    "Equip international employees with business-ready Japanese skills through AI-powered voice cloning, specialized curriculum, and real-time feedback.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
