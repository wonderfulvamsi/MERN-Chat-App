import React from 'react'
import Container from '@mui/material/Container';
import { Box, Paper } from '@mui/material';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import { Stack } from '@mui/material';
import loogo from './speech-bubble.png'
import logo from './Texting-pana.svg'
import { useState, useRef } from 'react';
import axios from 'axios';
import { Alert } from '@mui/material';
import { Link } from 'react-router-dom';

function LoginPg() {

    const [alert, setAlert] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const loggedin = useRef();
    const [username, setUsername] = useState("");

    const axiosAUTH = axios.create();

    const handleLogin = async () => {
        try {
            await axiosAUTH.post("http://localhost:5000/auth/login", {
                email: email,
                password: password
            }).then((res) => {
                if (res.data !== null) {
                    //for some reason local storage is not immediately updating and reflecting the changes in home.jsx
                    sessionStorage.setItem('accesstoken', res.data.accesstoken)
                    sessionStorage.setItem('refreshtoken', res.data.refreshtoken)
                    setUsername(res.data.user.username);
                    loggedin.current.click()
                }
                else {
                    console.log("fuck")
                    setAlert(true);
                    const close = setTimeout(() => { setAlert(false) }, 1000)
                    close();
                }
            })
        }
        catch (error) {
            console.log(error)
        }
    }
    return (
        <>
            <div className="topbar">
                <h3 className='topbartext'>React Chat App</h3>
            </div>
            {alert ? <Alert severity="error">Email or Password is Wrong</Alert> : <></>}
            <Stack direction="row" spacing={0} sx={{ bgcolor: '#ffffff' }}>
                <Box sx={{ marginLeft: '100px' }}>
                    <img className='illustration' src={logo} height='670' width='670' />
                </Box>
                <Container sx={{
                    position: "relavtive", alignItems: "center", alignContent: "center", display: "flex", justifyContent: "center"
                }}>
                    <Stack>
                        <Stack direction="row" spacing={2}>
                            <img src={loogo} height='75px' width='75'></img>

                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <h2>Welcome the React Chat App</h2>
                            </Box>
                        </Stack>
                        <h3>Please Login or SignUp your account to get started</h3>
                        <Stack spacing={2}>
                            <TextField label="Email" variant="outlined" onChange={(e) => setEmail(e.target.value)} />
                            <TextField label="Password" type="password" variant="outlined" onChange={(e) => setPassword(e.target.value)} />
                        </Stack>

                        <Box style={{
                            padding: "10px 36px",
                            margin: "10px 36px",
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <Stack direction="row" spacing={2}>
                                <Button sx={{
                                    fontSize: "18px"
                                }} variant="outlined" onClick={handleLogin}>Login</Button>
                                <Button sx={{
                                    fontSize: "18px"
                                }} variant="contained" component={Link} to="/signup">SignUp</Button>
                            </Stack>
                        </Box>
                        <Stack spacing={2}>
                            <Button
                                style={{
                                    backgroundColor: "#ea4334",
                                    padding: "10px 36px",
                                    fontSize: "18px"
                                }}
                                variant="contained"
                            >
                                Continue with Google
                            </Button>
                            <Button
                                style={{
                                    backgroundColor: "#2690bc",
                                    padding: "10px 36px",
                                    fontSize: "18px"
                                }}
                                variant="contained"
                            >
                                Continue with Facebook
                            </Button>
                            <Button
                                style={{
                                    backgroundColor: "#000000",
                                    padding: "10px 36px",
                                    fontSize: "18px"
                                }}
                                variant="contained"
                            >
                                Continue with GitHub
                            </Button>
                            <Link
                                style={{
                                    display: 'none'
                                }}
                                ref={loggedin}
                                to={'/home/' + username}
                            >
                                Loggedin!
                            </Link>
                        </Stack>
                    </Stack>
                </Container>
            </Stack>
        </>
    )
}

export default LoginPg