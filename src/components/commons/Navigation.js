import { NavLink } from "react-router-dom";
import routes from "../../router/routes";
import React from 'react';
import logo from '../../assets/edbp_logo.png'
const Navigation = () => {
  return (
    <aside className="grid grid-rows-14 w-full col-span-2 xl:col-span-1 relative h-screen">
      <NavLink to='/' className='p-2 bg-main row-span-1 flex items-center'><img src={logo} alt="Brand" /></NavLink>
      <div className="row-span-13 bg-accent_dark flex-grow  p-2 w-full flex flex-col">
        {routes.map(({ as, route, position }) =>
          <NavLink className={({ isActive }) => (`${isActive && ' font-semibold'}  ${'px-4 py-3 rounded-lg  cursor-pointer text-main hover:bg-accent_light w-full'}`)} key={position} to={route}>{as}</NavLink>
        )}
      </div>
    </aside>
  );
};

export default Navigation;