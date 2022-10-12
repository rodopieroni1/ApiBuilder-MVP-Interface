import React from 'react';
import { useState } from 'react';
import { MdClose, MdRemove } from "react-icons/md";
import useUpdateEffect from '../../hooks/useUpdateEffect';

const Modal = ({label, Component, onClose, openOn, ...rest}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [closing, setClosing] = useState(false)
    const [closeAction, setCloseAction] = useState(null)
    const handleOpen = () => {
      setIsOpen(!isOpen)
      setCloseAction(null)
    }
    const handleClose = (action) => {
      onClose && onClose(action)
      setClosing(true)
      setTimeout(() => {
        setCloseAction(action)
        setIsOpen(false)
        setClosing(false)
      }, 200)
    }
    useUpdateEffect(()=> {
        if (!openOn) return
        handleOpen()
    },[openOn])
    return (
      <>
        <button onClick={handleOpen} className='btn-primary w-fit mx-5'>{label}</button>
        <div className={`animate__animated ${isOpen ? (closing ? 'animate__fadeOut' : 'animate__fadeIn') : 'hidden'} w-screen h-screen flex flex-col items-center justify-center absolute bg-bg top-0 right-0 bg-opacity-90 z-10 p-5`}>
          <div className={`animate__animated ${closing ? 'animate__zoomOut' : 'animate__zoomIn'} max-h-full my-10 w-7/12 bg-main rounded-lg overflow-y-auto p-2`}>
            <div className='flex w-full justify-end'>
              <button onClick={(e) => handleClose(e.currentTarget.name)} type='button' name='minimize' className=' font-extrabold p-2 hover:bg-bg rounded-lg'><MdRemove /></button>
              <button onClick={(e) => handleClose(e.currentTarget.name)} type='button' name='close' className=' font-extrabold p-2 hover:bg-bg rounded-lg'><MdClose /></button>
            </div>
            <Component {...{...rest, isOpen, closeAction}}/>
          </div>
        </div>
      </>
    )
  }
 export default Modal