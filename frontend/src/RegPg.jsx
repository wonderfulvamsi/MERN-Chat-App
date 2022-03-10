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
import Alert from '@mui/material/Alert';
import { Link } from 'react-router-dom'

function RegPg() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordagain, setPasswordAgain] = useState("");
    const [alert, setAlert] = useState(false);
    const signedup = useRef();

    const axiosAUTH = axios.create();

    const handleSignup = async () => {
        if (password === passwordagain) {
            try {
                await axiosAUTH.post("http://localhost:5000/auth/register", {
                    email: email,
                    username: username,
                    password: password
                }).then((res) => {
                    if (res.status === 200) {
                        sessionStorage.setItem('accesstoken', res.data.accesstoken)
                        sessionStorage.setItem('refreshtoken', res.data.refreshtoken)
                        signedup.current.click()
                    }
                })
            }
            catch (error) {
                console.log(error)
            }
        }
        else {
            setAlert(true);
            const close = setTimeout(() => { setAlert(false) }, 1000)
            close();
        }
    }
    return (
        <>
            <div className="topbar">
                <h3 className='topbartext'>React Chat App</h3>
            </div>
            {alert ? <Alert severity="error">Password dosen't match!</Alert> : <></>}
            <Stack direction="row" spacing={0} sx={{ bgcolor: '#ffffff' }}>
                <Box sx={{ marginLeft: '100px' }}>
                    <img src={logo} height='670' width='670' />
                </Box>
                <Container sx={{
                    padding: "10px", alignItems: "center", alignContent: "center", display: "flex", justifyContent: "center"
                }}>
                    <Stack>
                        <Stack direction="row" spacing={2}>
                            <img src={loogo} height='75px' width='75'></img>

                            <div className="topbar">
                                <h3 className='topbartext'>React Chat App</h3>
                            </div>
                        </Stack>
                        <h3>Please Login or SignUp your account to get started</h3>
                        <Stack spacing={2}>
                            <TextField label="Enter Email" variant="outlined" onChange={(e) => setEmail(e.target.value)} />
                            <TextField label="Enter User Name" variant="outlined" onChange={(e) => setUsername(e.target.value)} />
                            <TextField label="Enter Password" type="password" variant="outlined" onChange={(e) => setPassword(e.target.value)} />
                            <TextField label="Enter Password Again" type="password" variant="outlined" onChange={(e) => setPasswordAgain(e.target.value)} />
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
                                }} variant="outlined" component={Link} to="/">Login</Button>
                                <Button sx={{
                                    fontSize: "18px"
                                }} variant="contained" onClick={handleSignup}> SignUp</Button>
                            </Stack>
                        </Box>
                        <Stack spacing={1}>
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
                                ref={signedup}
                                to={'/home/' + username}
                            >
                                Signed Up!
                            </Link>
                        </Stack>
                    </Stack>
                </Container>
            </Stack >
        </>
    )
}

export default RegPg