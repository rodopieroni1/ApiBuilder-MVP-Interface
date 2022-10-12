import React, { useState, useEffect } from 'react';
import Apis from './side-components/Apis';
import QueryViewer from './side-components/QueryViewer';
import Table from '../../components/libraries/Table';
import Dropdown from '../../components/libraries/Dropdown';
import Alert from '../../components/libraries/Alert';
import { MdLink, MdDelete, MdVisibility, MdEdit, MdPowerSettingsNew } from "react-icons/md";
import useCookies from 'react-cookie/cjs/useCookies';
import { useNavigate } from 'react-router';
const ApiList = () => {
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [id, setId] = useState('')
  const [viewerData, setViewerData] = useState(false)
  const [apis, setApis] = useState([])
  const URL = process.env.REACT_APP_BASE_URL
  const [cookie,,removeCookie] = useCookies()
  const token = cookie.token || ''
  const navigate = useNavigate()

  const remove= ({id, name}) => {
    Alert.fire({
      title: `Esta por eliminar ${name}`,
      text: "Esta accion no se puede revertir",
      icon: "warning",
      confirmButtonText: "Eliminar Api",
      cancelButtonText: "Cancelar",
      showCancelButton: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true)
        fetch(`${URL}/apis/${id}`, {
          method: "DELETE",
          headers: {
              'Content-type': 'application/json',
              'Authorization': token
          }
        }).then(res => {
          setLoading(false)
          return res.json()
        })
        .catch(({message}) => {
          Alert.fire("¡Ops!", message, "error");
        })
        .then(({msg, success,type}) => {
          
          if(success){
            setLoading(false)
            Alert.fire("¡Perfecto!", msg, "success");
            return
          } 

          if(type === 'auth') {
            Alert.fire(msg, 'Ingrese nuevamente', "warning");
            removeCookie('token')
            navigate('/login')
          }else{
            Alert.fire("¡Ops!", msg, "error");
          }
          
        })
      }
    })
  }

  const edit= ({id}) => {
      setId(id)
      setIsOpen(true)
  }
  const handleStatus= ({id, status, name}) => {
    setLoading(true)
    fetch(`${URL}/apis/${id}`, {
      method: 'PATCH', 
      body: JSON.stringify({status:!status}), 
      headers:{
        'Content-Type': 'application/json',
        'Authorization': token
      }
    }).then(res => res.json())
    .catch(({message}) => {
      Alert.fire("¡Ops!", message, "error");
    })
    .then(({success, msg, type}) => {
      if(success){
        setLoading(false)
        Alert.fire("¡Perfecto!", `Actualizaste el estado de ${name}`, "success");
        return
      } 
      
      if(type === 'auth') {
        Alert.fire(msg, 'Ingrese nuevamente', "warning");
        removeCookie('token')
        navigate('/login')
      }else{
        Alert.fire("¡Ops!", msg, "error");
      }
      
    });
  }

  const handleSqlViewer = (api)=> {
    setViewerData(api)
  }


  const dropdownOptions= [
    {label: <span className='flex items-center justify-center py-2 text-sm'>Query<MdVisibility className='mx-2'/></span>, action: handleSqlViewer},
    {label: <span className='flex items-center justify-center py-2 text-sm'>Editar<MdEdit className='mx-2'/></span>, action: edit},
    {label: <span className='flex items-center justify-center py-2 text-sm'>Remover<MdDelete className='mx-2'/></span>, action: remove},
    {label: <span className='flex items-center justify-center py-2 text-sm'>Cambiar estado<MdPowerSettingsNew className='mx-2'/></span>, action: handleStatus}
  ]

  const columns = [
    {
      label: 'Nombre',
      property: 'name',
    },
    {
      label: 'Ruta de contexto',
      property: 'endpoint',
      cell: (data) => ('/' + data)
    },
    {
      label: 'Autor',
      property: 'author',
    },
    {
      label: 'Estado',
      property: 'status', 
      cell: (data) => (
        data ? <span className='text-success font-medium'>Iniciado</span> : <span className='text-danger font-medium'>Detenido</span>
      )
    },
    {
      label: 'Api',
      property: 'endpoint', 
      cell: (data) => <a href={`${URL}/${data}`} target='_blank' rel="noreferrer" className='flex items-center hover:text-primary'><MdLink className='mx-2'/>{`${URL}/${data}`}</a>,
    },
    {
      label: 'Acciones',
      center: true,
      cell: (o) => <Dropdown object={o} options={dropdownOptions}/>
    },
  ]

  useEffect(() => {
    if(loading) return
    fetch(`${URL}/apis`,{headers:{'Authorization': token}}).then(res => res.json())
      .catch(error => console.error('Error:', error))
      .then(({success, msg, items, type})  => {
        if(success){
          setApis(items)
          return
        } 
        
        if(type === 'auth') {
          Alert.fire(msg, 'Ingrese nuevamente', "warning");
          removeCookie('token')
          navigate('/login')
        }else{
          Alert.fire("¡Ops!", msg, "error");
        }
      })
  }, [loading, URL, removeCookie, navigate, token])

  return (
    <div className='grid-rows-12 grid-cols-12 grid'>
      <Apis {...{ isOpen, setIsOpen, setLoading, id, setId, loading }} />
      <QueryViewer {...{viewerData, setViewerData}}/>
      <div className='w-full col-span-12 flex justify-end'>
        <button onClick={() => setIsOpen(true)} className='btn-primary w-fit mx-5'>{id ? 'Continuar edicion' : 'Añadir API' }</button>
      </div>
      <div className='col-span-12 row-span-11 h-full bg-main overflow-x-auto rounded-lg'>
        <Table data={apis} columns={columns}/>
      
      </div>
    </div>
  );
};

export default ApiList;