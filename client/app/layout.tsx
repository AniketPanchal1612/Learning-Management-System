"use client";
import "./globals.css";
import type { Metadata } from "next";
import { Inter, Josefin_Sans, Poppins } from "next/font/google";
import { ThemeProvider } from "./utils/theme-provider";
import { Toaster } from "react-hot-toast";
import { Providers } from "./Provider";
import { SessionProvider } from "next-auth/react";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import Loader from "./components/Loader/Loader";
import { FC, useEffect } from "react";
// const inter = Inter({ subsets: ['latin'] })

import socketIo from 'socket.io-client'
const ENDPOINT= process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || ""
const socketId = socketIo(ENDPOINT,{transports:["websocket"]})
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-Poppins",
});
const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-Josefin",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log(ENDPOINT)
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${poppins.variable} ${josefin.variable} !bg-white bg-no-repeat dark:bg-gradient-to-b dark:from-gray-950 dark:to-black duration-500`}
      >
        <Providers>
          <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <Custom>
                {children}
              </Custom>
              <Toaster position="top-center" reverseOrder={false} />
            </ThemeProvider>
          </SessionProvider>
        </Providers>
      </body>
    </html>
  );
}

const Custom: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading } = useLoadUserQuery({});

  useEffect(()=>{
    socketId.on("connection",()=>{})
  },[])

  return (
    <>
    {isLoading ? <Loader /> : <>{children} </>
    }</>
  );
};
