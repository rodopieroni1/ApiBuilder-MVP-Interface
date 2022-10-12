import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import routes from './routes'
import TopBar from '../components/commons/TopBar';
import Login from './side-components/Login';
import { useEffect } from 'react';
import useCookies from 'react-cookie/cjs/useCookies';
const URL = process.env.REACT_APP_BASE_URL

const ComponentWrapper = ({ Component, title, privated ,as}) => {
  const [cookie,,removeCookie] = useCookies();
  const token = cookie.token || ''
  const navigate = useNavigate()
  const location = useLocation()
  useEffect(()=> {
    const wrapper = document.getElementById(as)?.children[0]
    wrapper.className += ' bg-main rounded-lg h-full'
    if (privated) {
      fetch(`${URL}/jwt/validate`,{
        method: 'GET',
        headers:{
          'Authorization': token
        }
    }).then(res => res.json())
      .catch(error => console.log(error.response.data))
      .then(response => {
        if (!response.success) {
          removeCookie('token')
          navigate('/login')
        }
      })
    }
  },[location.pathname,navigate,privated,token,removeCookie,as])
  return (
    <div className='col-span-10 xl:col-span-11 grid grid-rows-14 h-screen'>
      <div className='row-span-1'>
        <TopBar title={title} />
      </div>
      <div id={as} className='row-span-13 p-5'>
        <Component/>
      </div>
    </div>
  )
}

const LoginRoute = ({ Component, ...rest }) => {
  const [cookie] = useCookies();
  const token = cookie.token || ''
  return token ? <Navigate to={routes[0].route} />  : <Component {...rest} />
}


const Router = () => {
    return (
          <Routes>
            <Route path='/login' element={<LoginRoute Component={Login}/>}/>
              {routes.map(({route, as, Component, params, title, privated}) => (
                  <Route key={as} path={route + params} element={<ComponentWrapper {...{Component, title, privated, as}} />} />
              ))}
              <Route path="*" element={<Navigate to={routes[0].route} replace />} />
          </Routes>
    );
};

export default Router;