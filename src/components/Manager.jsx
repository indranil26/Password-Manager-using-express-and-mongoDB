import { v4 as uuidv4 } from 'uuid';
import React, { useEffect } from 'react'
import { useRef, useState } from 'react';
import { FaCopy } from "react-icons/fa6";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'

const Manager = () => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const API_URL = import.meta.env.VITE_API_URL;
    const ref = useRef()
    const passwordRef = useRef()
    const [form, setform] = useState({ site: "", username: "", password: "" })
    const [passwordArray, setpasswordArray] = useState([])

    const validateForm = () => {
        const urlRegex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,6}(\/)?$/;
        const usernameRegex = /^[a-zA-Z0-9._-]{3,}$/; // Alphanumeric, dot, underscore, and hyphen allowed, minimum 3 characters
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_\-+={}[\]|\\;:"'<>,./?])[A-Za-z\d~`!@#$%^&*()_\-+={}[\]|\\;:"'<>,./?]{8,}$/; // Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character


        if (!urlRegex.test(form.site)) {
            toast.error('Invalid website URL', { theme: "dark" , draggable: false });
            return false;
        }

        if (!usernameRegex.test(form.username)) {
            toast.error('Invalid username', { theme: "dark" , draggable: false  });
            return false;
        }

        if (!passwordRegex.test(form.password)) {
            toast.error('Invalid password', { theme: "dark" , draggable: false  });
            return false;
        }

        return true;
    }


    const getPasswords = async () => {
        if (isAuthenticated) {
            try {
                const token = await getAccessTokenSilently({ audience: import.meta.VITE_AUTH0_AUDIENCE })
                // console.log(token)
                let req = await axios.get(`${API_URL}/passwords`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                })

                setpasswordArray(req.data)
            } catch (error) {
                console.error(error)
            }

            // console.log(passwords)
        }
    }

    useEffect(() => {
        if (isAuthenticated) {
            getPasswords()
        }

    }, [isAuthenticated])

    const copyText = (text) => {
        toast('Copied to clipboard!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            progress: undefined,
            theme: "dark",
        });
        navigator.clipboard.writeText(text)
    }

    const showPassword = () => {
        passwordRef.current.type = "text"
        if (ref.current.src.includes("icons/eye-cross.png")) {
            ref.current.src = "icons/eye.png"
            passwordRef.current.type = "password"
        }
        else {
            ref.current.src = "icons/eye-cross.png"
            passwordRef.current.type = "text"
        }

    }

    const savePassword = async () => {
        if (isAuthenticated) {
            if (validateForm()) {
                try {
                    const token = await getAccessTokenSilently({ audience: import.meta.env.VITE_AUTH0_AUDIENCE })
                    if (form.id) {
                        await axios.put(`${API_URL}/passwords`, { ...form }, {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            }
                        })
                        setpasswordArray(passwordArray.map(item => item.id === form.id ? form : item))
                        setform({ site: "", username: "", password: "" })
                        toast('Password updated!', {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: false,
                            progress: undefined,
                            theme: "dark",

                        });
                    }
                    else {
                        const newPassword = { ...form, id: uuidv4() }
                        await axios.post(`${API_URL}/passwords`, newPassword, {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            }
                        })
                        setpasswordArray([...passwordArray, newPassword])
                        setform({ site: "", username: "", password: "" })
                        toast('Password saved!', {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: false,
                            progress: undefined,
                            theme: "dark",

                        });
                    }
                } catch (error) {
                    console.log(error.message)
                }
            }
            else {
                toast("Error: Password not saved!",{ draggable: false })
            }
        }
        else {
            alert("Please login to add password")
        }
    }


    const deletePassword = async (id) => {
        if (isAuthenticated) {
            // console.log("Deleting password with id", id)
            let conf = confirm("Do you really want to delete this password?")
            if (conf) {
                try {
                    const token = await getAccessTokenSilently({ audience: import.meta.VITE_AUTH0_AUDIENCE })
                    await axios.delete(`${API_URL}/passwords`, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        data: { id },
                    })
                } catch (error) {
                    console.log(error)
                }

                setpasswordArray(passwordArray.filter(item => item.id !== id))
                // localStorage.setItem("passwords", JSON.stringify(passwordArray.filter(item => item.id !== id)))

                toast('Password Deleted!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: false,
                    progress: undefined,
                    theme: "dark",
                });
            }
        }
    }


    const editPassword = async (id) => {
        if (isAuthenticated) {
            const passwordToEdit = passwordArray.find(item => item.id === id)
            setform(passwordToEdit)
        }
    }


    const handleChange = (e) => {
        setform({ ...form, [e.target.name]: e.target.value })
        // console.log(passwordArray)

    }


    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light" />
            {/* Same as */}
            <ToastContainer />
            <div className="absolute inset-0 -z-10 h-full w-full bg-green-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"><div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-green-400 opacity-20 blur-[100px]"></div></div>
            <div className="p-3 md:mycontainer min-h-[84vh]">
                <h1 className='text-4xl font-bold text-center'><span className='text-green-500'>&lt;</span>
                    Pass<span className='text-green-500'>OP/ &gt;</span></h1>
                <p className='text-green-900 text-lg text-center'>Your own Password Manager</p>
                <div className="text-black flex flex-col p-4 gap-8 items-center">
                    <input value={form.site} onChange={handleChange} placeholder='Enter website URL' className='rounded-full border border-green-500 w-full p-4 py-1' type="text" name="site" id='site' />
                    <div className="flex flex-col md:flex-row w-full justify-between gap-8">
                        <input value={form.username} onChange={handleChange} placeholder='Enter Username' className='rounded-full border border-green-500 w-full p-4 py-1' type="text" name="username" id="username" />
                        <div className="relative">

                            <input ref={passwordRef} value={form.password} onChange={handleChange} placeholder='Enter Password' className='rounded-full border border-green-500 w-full p-4 py-1' type="password" name="password" id='password' />
                            <span className='absolute right-[3px] top-[4px] cursor-pointer' onClick={showPassword} >
                                <img ref={ref} className='p-1' width={26} src="/icons/eye.png" alt="" />
                            </span>
                        </div>
                    </div>

                    <button onClick={savePassword} className='flex justify-center items-center bg-green-400 rounded-full px-8 py-2 w-fit hover:bg-green-300 gap-2 border border-green-900'><lord-icon
                        src="https://cdn.lordicon.com/jgnvfzqg.json"
                        trigger="hover">
                    </lord-icon> Save </button>
                </div>
                <div className="passwords overflow-x-auto">
                    <h2 className='font-bold text-2xl py-4'>Your Passwords</h2>
                    {passwordArray.length === 0 && <div> No Passwords to show</div>}
                    {passwordArray.length != 0 && <table className="table-auto w-full rounded-md overflow-hidden mb-10">
                        <thead className='bg-green-800 text-white'>
                            <tr>
                                <th className='py-2'>Site</th>
                                <th className='py-2'>Username</th>
                                <th className='py-2'>Password</th>
                                <th className='py-2'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='bg-green-100'>
                            {passwordArray.map((item, index) => {
                                return <tr key={index}>
                                    <td className=' py-2 border border-white text-center'><div className='flex justify-center items-center gap-2'><a href={item.site.startsWith('http')? item.site : `https://${item.site}`} target='_blank'>{item.site}</a><FaCopy style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }} className='size-4 cursor-pointer copyicons' onClick={() => { copyText(item.site) }} /></div></td>
                                    <td className='py-2 border border-white text-center break-words'><div className='flex justify-center items-center gap-2'>{item.username}<FaCopy style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }} className='size-4 cursor-pointer copyicons' onClick={() => { copyText(item.username) }} /></div></td>
                                    <td className='py-2 border border-white text-center break-words'><div className='flex justify-center items-center gap-2'>{"*".repeat(item.password.length)}<FaCopy style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }} className='size-4 cursor-pointer copyicons' onClick={() => { copyText(item.password) }} /></div></td>
                                    <td className='py-2 border border-white text-center break-words'><div className='flex justify-center items-center gap-2'><span onClick={() => { editPassword(item.id) }} className='mx-1'><FaEdit style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }} className='size-4 cursor-pointer' /></span><span onClick={() => { deletePassword(item.id) }} className='mx-1'><RiDeleteBin6Fill style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }} className='size-4 cursor-pointer copyicons' /></span></div></td>
                                </tr>
                            })}
                        </tbody>
                    </table>}
                </div>
            </div>
        </>
    )
}

export default Manager
