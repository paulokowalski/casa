import { Outlet } from "react-router-dom";
import { Header } from "./views/Header";
import { GlobalStyle } from "./styles/global";

function App() {
  return (
    <>
      <GlobalStyle/>
      <Header/>
      <Outlet/>
    </>
  )
}

export default App;