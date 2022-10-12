import React, {useState} from 'react';
import { MdMoreVert } from "react-icons/md";
const Dropdown = ({options, object}) => {
  const [isOpen, setIsOpen]= useState(false)
  const [closing, setClosing] = useState(false)
  const handleDropdown = () => {
    if(!options) return
    if (isOpen) {
      setClosing(true)
      setTimeout(()=> {
        setIsOpen(false)
        setClosing(false)
      },200)
    } else {
      setIsOpen(true)
    }
  }
  return (
      <span  onClick={() => handleDropdown()} className={`${isOpen && 'bg-bg'} px-5 py-2 w-full h-full flex justify-center relative cursor-pointer `}>
      {isOpen && <span className='h-screen w-screen fixed top-0 right-0 z-10'></span>}
        <MdMoreVert/>
        <div className={`${isOpen ? ( closing ? 'animate__zoomOut' : 'animate__zoomIn') : 'hidden'}
        flex flex-col border border-bg w-full absolute animate__animated  z-20 top-full rounded-lg overflow-hidden`}>
          {options?.map(({label, action},i)=> (
            <button key={label + i} onClick={()=> action(object)} className='bg-main hover:bg-bg w-full' type='button'>{label}</button>
          ))}
        </div>
        </span>
  );
};

export default Dropdown;