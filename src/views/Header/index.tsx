import Navbar from "../../components/Navbar";
import { Container, Content } from "./styles";

export function Header() {
    return (
        <Container>
            <Content>
                <h1>Kowalski House</h1>
                <Navbar/>
            </Content>
        </Container>
    )
}