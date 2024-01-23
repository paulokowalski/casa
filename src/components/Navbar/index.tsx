import { Link } from "react-router-dom";

const Navbar = () => {

    return (
        <nav>
            <Link to="/"> Home</Link>
            <Link to="/financa"> Finanças</Link>
            <Link to="/geracao"> Geração</Link>
        </nav>
    )
}

export default Navbar;