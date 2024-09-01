import type { AppProps } from 'next/app';
import {NextUIProvider} from "@nextui-org/react";
import {ThemeProvider as NextThemesProvider} from "next-themes";
import { Toaster } from 'react-hot-toast';
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextUIProvider>
      <NextThemesProvider attribute='class' defaultTheme='light' themes={['light', 'dark', 'instructor', 'student']}>
        <Toaster position='bottom-right'/>
        <Component {...pageProps} />
      </NextThemesProvider>        
    </NextUIProvider>
      
    
  );
}
