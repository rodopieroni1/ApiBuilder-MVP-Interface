import React, { Children, isValidElement, cloneElement } from 'react';
import { useCallback } from 'react';
import { useState } from 'react';
import { MdClose, MdRemove } from "react-icons/md";

const useModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [closeAction, setCloseAction] = useState(null)
  const handleOpen = () => {
    setIsOpen(!isOpen)
    setCloseAction(null)
  }
  const Modal = useCallback(({ children, Component, onClose, ...rest }) => {
    const handleClose = (action) => {
      onClose && onClose(action)
      setClosing(true)
      setTimeout(() => {
        setCloseAction(action)
        setIsOpen(false)
        setClosing(false)
      }, 200)
    }
    return (
      <div className={`animate__animated ${isOpen ? (closing ? 'animate__fadeOut' : 'animate__fadeIn') : 'hidden'} w-screen h-screen flex flex-col items-center justify-center absolute bg-bg top-0 right-0 bg-opacity-90 z-10 p-5`}>
        <div className={`animate__animated ${closing ? 'animate__zoomOut' : 'animate__zoomIn'} max-h-full my-10 w-7/12 bg-main rounded-lg overflow-y-auto p-2`}>
          <div className='flex w-full justify-end'>
            <button onClick={(e) => handleClose(e.currentTarget.name)} type='button' name='minimize' className=' font-extrabold p-2 hover:bg-bg rounded-lg'><MdRemove /></button>
            <button onClick={(e) => handleClose(e.currentTarget.name)} type='button' name='close' className=' font-extrabold p-2 hover:bg-bg rounded-lg'><MdClose /></button>
          </div>
          {Children.map(children, (child) => {
            if (!isValidElement(child)) return child
            return cloneElement(child, {
              ...child.props,
              ...rest,
              isOpen,
              closeAction
            })
          })}
        </div>
      </div>
    )
  }, [closeAction, closing, isOpen])
  return [Modal, handleOpen]
};

export default useModal;