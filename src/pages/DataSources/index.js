import React, { useState, useEffect } from 'react';
import Table from '../../components/libraries/Table';
import Dropdown from '../../components/libraries/Dropdown';
import { MdDelete, MdEdit } from "react-icons/md";
import useCookies from 'react-cookie/cjs/useCookies';
import { useNavigate } from 'react-router';
import Alert from '../../components/libraries/Alert';
import AddOrEdit from "./side-components/AddOrEdit"
import Modal from '../../components/libraries/Modal';

const DataSources = () => {
  const [dataSources, setDataSources] = useState([])
  const [loading, setLoading] = useState(false)
  const [id, setId] = useState('')
  const URL = process.env.REACT_APP_BASE_URL
  const [cookie, , removeCookie] = useCookies()
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
        fetch(`${URL}/datasources/${id}`, {
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
      
  }

  const dropdownOptions= [
    {label: <span className='flex items-center justify-center py-2 text-sm'>Editar<MdEdit className='mx-2'/></span>, action: edit},
    {label: <span className='flex items-center justify-center py-2 text-sm'>Remover<MdDelete className='mx-2'/></span>, action: remove}
  ]
  const columns = [
    {
      label: 'Nombre de la conexión',
      property: 'name',
    },
    {
      label: 'Cliente',
      property: 'client',
    },
    {
      label: 'Usuario',
      property: 'user',
    },
    {
      label: 'Acciones',
      center: true,
      cell: (o) => <Dropdown object={o} options={dropdownOptions}/>
    },
  ]


  useEffect(() => {
    if (loading) return
    fetch(`${URL}/dataSources`, { headers: { 'Authorization': token } }).then(res => res.json())
      .catch(error => console.error('Error:', error))
      .then(({ success, msg, items, type }) => {
        if (success) {
          setDataSources(items)
          return
        }

        if (type === 'auth') {
          Alert.fire(msg, 'Ingrese nuevamente', "warning");
          removeCookie('token')
          navigate('/login')
        } else {
          Alert.fire("¡Ops!", msg, "error");
        }

      })
  }, [loading, URL, removeCookie, navigate, token])

  return (
    <div className='grid-rows-12 grid-cols-12 grid'>
      <div className='w-full col-span-12 flex justify-end'>
        <Modal {...{
          label:id ? 'Continuar edición' :'Añadir Origen', 
          onClose:(action) => action === 'close' &&  setId(''), 
          loading, 
          setLoading, 
          id,
          setId,
          openOn:id,
          Component: AddOrEdit
          }} />
      </div>
      <div className='col-span-12 row-span-11 h-full bg-main overflow-x-auto rounded-lg'>
        <Table data={dataSources} columns={columns} />
      </div>
    </div>
  );
};

export default DataSources;