import Navbar from "../../components/Navbar";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";

export function Header() {
    return (
        <AppBar position="static">
            <Toolbar>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: 1200,
                    margin: '0 auto',
                    padding: '0 16px'
                }}>
                    <Typography variant="h6" component="h1">
                        Kowalski House
                    </Typography>
                    <Navbar/>
                </Box>
            </Toolbar>
        </AppBar>
    )
}