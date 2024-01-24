import { useContext } from "react";
import { GeracaoContext, GeracaoProvider } from "../../contexts/GeracaoContext";
import { Meio } from "./Meio";
import { GlobalStyle } from "../../styles/global";

export function Home() {

  const { geracao } = useContext(GeracaoContext);
  console.log(geracao)

  return (
    <>
      <GeracaoProvider>
        <Meio/>
        <GlobalStyle/>
      </GeracaoProvider>
    </>
  )
}