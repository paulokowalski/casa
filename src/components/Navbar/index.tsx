import { Box, Button } from "@mui/material";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
                component={Link}
                to="/"
                color="inherit"
                sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}
            >
                Home
            </Button>
            <Button
                component={Link}
                to="/financa"
                color="inherit"
                sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}
            >
                Finanças
            </Button>
        </Box>
    )
}

export default Navbar;