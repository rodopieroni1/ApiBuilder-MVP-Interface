import React, {useState, useEffect} from 'react'

import AceEditor from "react-ace"

import "ace-builds/src-min-noconflict/ext-language_tools"
import "ace-builds/src-min-noconflict/mode-mysql"
import "ace-builds/src-noconflict/theme-github"
import useUpdateEffect from '../../hooks/useUpdateEffect'
import { MdKeyboardArrowDown } from 'react-icons/md'

export const Form = ({onSubmit, children, className, listenChange, onChange, ...rest}) => {
    const handleSubmit = (e) => {
        e.preventDefault()
        const values = Array.from(e.target.getElementsByTagName('input')).reduce((a,{name, value,...rest}) =>
         ((value && name) ? {...a, [name]: rest.hasOwnProperty('checked') ? rest.checked : value} : a),{})
        onSubmit(values, e.target)
    }
    const onListenChange = ({target:{name}}) => {
        if(listenChange.includes(name)) onChange(name)
    }
    return (
        <form onChange={listenChange ? onListenChange : onChange} className={`relative w-full ${className}`}  onSubmit={handleSubmit} {...rest}>
         {children}
        </form>
    );
};

// ----------------------------------------------------------------------------------------------

export const Input = ({ label, template, ...rest }) => {
    return (
        <div className={`flex flex-col m-2 flex-grow ${rest.disabled && 'text-text-disabled'}`}>
        {label && <label className='text-sm font font-semibold m-1'>{label}</label>}
        <span className='bg-bg rounded-lg px-3 py-1 flex'>{template && <span className='px-1'>{template}</span>}<input className='focus:outline-none bg-bg w-full' type='text' {...rest} /></span>
      </div>
    );
};

// ----------------------------------------------------------------------------------------------


export const InputMultiSelect = ({label, options=[], onSelect, defaultValue, placeholder,reset, required, ...rest}) => {
    const [values, setValues] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const handleDropdown= () => {
        if(!options.length) return
        setIsOpen(!isOpen)
    }
    const handleChange= (e) => {
        const selected = e.target.value
        if (!selected){
            setValues([])
            onSelect && onSelect([])
            return
        }
        let items
        if(values.includes(selected)){
            items = values.filter(e => e!== selected)
        } else {
            items = [...values, selected]
        }
        onSelect && onSelect(items)
        setValues(items)
    }
    useEffect(()=> {
        setValues(defaultValue || [])
        setIsOpen(false)
    },[defaultValue, reset])
    
    return (
        <div className='flex flex-col m-2 relative flex-grow' >
            {isOpen && <div onClick={handleDropdown} className='w-full h-full fixed top-0 left-0 z-10'></div>}
            {label && <label className='text-sm font font-semibold m-1'>{label}</label>}
            <input 
                title={values} 
                onClick={handleDropdown} 
                placeholder={options?.length ? placeholder || 'Elije una opción' : 'Esperando opciones..'} 
                readOnly 
                className='bg-bg rounded-lg pl-3 pr-5 py-1 flex-grow cursor-default focus:outline-none placeholder:text-text placeholder:pl-1' 
                value={ values || defaultValue || []} {...rest} 
                type="text" 
                required={required} 
                />
            <MdKeyboardArrowDown className='absolute right-0 bottom-1' size={20}/>
            <select  multiple value={values} className={`${!isOpen && 'hidden'} bg-bg border border-text absolute top-full w-full z-20 focus:outline-none`} onChange={handleChange} {...rest}>
                <option className='hover:bg-accent hover:text-main px-3 ' onClick={()=> setValues([])} value='' >Default</option>
                {options?.map(({value, label},i) => 
                <option 
                className={`hover:bg-accent hover:text-main px-3 ${values.includes(value) && 'bg-accent text-main'}`}  
                key={value + label + i} 
                value={value}>{label}
                </option>)}
            </select>
        </div>

)
}

// ----------------------------------------------------------------------------------------------

export const InputSelect = ({label, options=[], onSelect, defaultValue, placeholder,reset,parentNode, ...rest}) => {
    const [value, setValue] = useState('')
    const handleChange= (e) => {
        onSelect && onSelect(e.target)
        setValue(e.target.value)
    }
    useEffect(()=> {
        setValue(defaultValue || '')
    },[defaultValue, reset])
    
    return (
        <div className='flex flex-col m-2 flex-grow'>
            {label && <label className='text-sm font font-semibold m-1'>{label}</label>}
            <select value={value} className='bg-bg rounded-lg focus:outline-none px-3 py-1 flex-grow ' onChange={handleChange} {...rest}>
                <option value={''} >{options?.length ? placeholder || 'Elije una opción' : 'Esperando opciones..'}</option>
                {options?.map(({value, label},i) => <option  key={value + label + i} value={value}>{label}</option> )}
            </select>
            <input readOnly className='hidden' value={ value || defaultValue || ''} {...rest} type="text" />
        </div>

);
};

// ----------------------------------------------------------------------------------------------

export const SqlEditor = ({onChange, table, placeholder, defaultValue, query,readOnly, ...rest}) => {
    const [value, setValue] = useState('')
    const handleChange = (newValue) => {
        const value = newValue.replace(/\n/g,' \n').replace(/  +/g,' ')
        onChange && onChange(value)
        setValue(value)
      }

      useUpdateEffect(()=> {
        setValue(query || '')
    },[query])

    useUpdateEffect(()=> {
        setValue(defaultValue || '')
    },[defaultValue])

    return (
        <div className='h-full'>
            <AceEditor
            id="editor"
            aria-label="editor"
            mode="mysql"
            theme="github"
            name="editor"
            fontSize={16}
            width="100%"
            height='100%'
            showPrintMargin={false}
            showGutter
            readOnly={readOnly}
            placeholder={placeholder || "Escribe tu consulta..."}
            editorProps={{ $blockScrolling: true }}
            setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
            }}
            onChange={handleChange}
            value={value}
            showLineNumbers
            />
            <input readOnly className='hidden' value={ value || defaultValue || ''} {...rest} type="text" />
        </div>
    );
};