import { ColorModeScript } from "@chakra-ui/react";
import { Head, Html, Main, NextScript } from "next/document";
import theme from "../theme";

export default function Document(): JSX.Element {
  return (
    <Html lang={"en"}>
      <Head />
      <body>
        <ColorModeScript initialColorMode={"dark"} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
