import React from 'react';
import Dropdown from '../libraries/Dropdown';
import { MdLogout } from 'react-icons/md';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router';
const TopBar = ({ title }) => {
  const navigate = useNavigate()
  const [,,removeCookie] = useCookies()
  const handleLogOut = () => {
    removeCookie('token')
    navigate('/login')
  }
  const dropdownOptions= [
    {label: <span className='flex items-center justify-center py-2 text-sm'>Cerrar sesión<MdLogout className='mx-2'/></span>, action: handleLogOut},
  ]
  return (
    <div className='bg-main p-2 w-full h-full flex items-center'>
      <div className='flex-grow'>
        <h1 className='font-bold'>{title}</h1>
      </div>
      <div className='hover:bg-bg rounded-lg w-36'>
        <Dropdown options={dropdownOptions}/>
      </div>
    </div>
  );
};

export default TopBar;