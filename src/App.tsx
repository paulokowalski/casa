import { Routes, Route } from "react-router-dom";
import { GlobalStyle } from "./styles/global";
import { Layout } from "./components/Layout";
import { Home } from "./views/Home";
import { Financa } from "./views/Financa";

function App() {
  return (
    <>
      <GlobalStyle/>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/financa" element={<Financa />} />
        </Routes>
      </Layout>
    </>
  )
}

export default App;