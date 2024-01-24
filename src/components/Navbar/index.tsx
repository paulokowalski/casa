import { Link } from "react-router-dom";
import { NavbarLink, NavbarLinkContainer } from "./styles";

const Navbar = () => {

    return (
        <NavbarLinkContainer>
            <NavbarLink className="nav-link" to="/"> Home</NavbarLink >
            <NavbarLink className="nav-link" to="/financa"> Finanças</NavbarLink >
        </NavbarLinkContainer>
    )
}

export default Navbar;