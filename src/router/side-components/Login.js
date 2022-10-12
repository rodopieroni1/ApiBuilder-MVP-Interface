import React from 'react';
import { Form, Input } from '../../components/form/index'
import logo from '../../assets/edbp_logo.png'
import { useNavigate } from 'react-router';
import Alert from '../../components/libraries/Alert';
import useCookies from 'react-cookie/cjs/useCookies';
import { MdLogin } from 'react-icons/md';
const URL = process.env.REACT_APP_BASE_URL
const Login = () => {
    const navigate = useNavigate()
    const [,setCookie] = useCookies();
    const handleSubmit = (data, form) => {
        console.log(data)
        fetch(`${URL}/login`, {
            method: 'POST', 
            body: JSON.stringify(data), 
            headers:{
              'Content-Type': 'application/json'
            }
          }).then(res => res.json())
          .catch(({response: {data}}) => {
            Alert.fire("¡Ops!", data.msg, "error");
          }).then(response => {
            if (response.success) {
                console.log(response)
                form.reset()
                setCookie('token', response.result.token)
                navigate('/')
            }else{
                Alert.fire("¡Ops!", response.msg, "error")
            }
          })
    }
    return (
        <div className='w-full h-full bg-accent_dark grid grid-cols-12 absolute top-0 left-0 p-5'>
            <div className='col-span-8 bg-accent_light rounded-l-lg  text-main flex flex-col justify-center px-4 lg:px-16'>
                <h1 className='text-3xl md:text-5xl font-semibold my-2'>Bienvenido a Api builder platform</h1>
                <p className='my-2 text-lg'>Puedes iniciar sesión con una cuenta existente</p>
            </div>
            <Form onSubmit={handleSubmit} className='col-span-4 px-10 flex flex-col items-center justify-center bg-main rounded-r-lg  '>
                <img className='p-5  w-4/6' src={logo} alt="logo edbp" />
                <div className='w-full flex my-2'>
                    <Input placeholder='Ej: admin@gmail.com' label='Email' type='email' name='email'/>
                </div>
                <div className='w-full flex my-2'>
                    <Input placeholder='Escriba su contraseña' label='Contraseña' type='password' name='password'/>
                </div>
                <button className='btn-primary w-fit flex items-center' type='submit'><MdLogin className='mr-2'/>Iniciar Sesion</button>
            </Form>
        </div>
    );
};

export default Login;