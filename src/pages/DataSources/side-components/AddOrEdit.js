import React from 'react';
import useUpdateEffect from '../../../hooks/useUpdateEffect';
import { useState } from 'react';
import { Form, Input, InputSelect } from '../../../components/form';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router';
import Alert from '../../../components/libraries/Alert';
import Loader from '../../../components/Loader'
import { formatOptions } from '../../../components/libraries/utils';

const URL = process.env.REACT_APP_BASE_URL
const AddOrEdit = ({ setId,id, loading, setLoading, isOpen, closeAction }) => {

  const [inputReference, setInputReference] = useState('')
  const [isConnectionOk, setIsConnectionOk] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)
  const [resetSelect, setResetSelect] = useState(false)
  const [clients, setClients] = useState([])
  const [clientMap, setClientMap] = useState({})
  const [cookie, , removeCookie] = useCookies()
  const token = cookie.token || ''
  const navigate = useNavigate()
  const form = document.getElementsByTagName('form')[0]

  // User for edit
  const [edit, setEdit] = useState(null)
  const cancelEdit = () => {
    setEdit(null)
    setId('')
    setIsConnectionOk(false)
    setInputReference('')
    form.reset()
  }
  const submitFunctions = {
    'main-submit': (values, form) => {
      setLoading(true)
      fetch(`${URL}/datasources/${edit ? id : ''}`, {
        method: edit ? 'PATCH' : 'POST',
        body: JSON.stringify(values),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      }).then(res => res.json())
        .catch(({ message }) => {
          Alert.fire("¡Ops!", message, "error");
        })
        .then(({ success, msg, item, type }) => {
          setLoading(false)
          if (success) {
            Alert.fire("¡Perfecto!", msg, "success");
            form.reset()
            cancelEdit()
            setInputReference('')
            setIsConnectionOk(false)
            return
          }
          if (type === 'auth') {
            removeCookie('token')
            navigate('/login')
            Alert.fire(msg, 'Ingrese nuevamente', "warning")
          } else {
            Alert.fire("¡Ops!", msg, "error");
          }
        })
      
    },
    'test-connection': (values) => {
      setLocalLoading(true)
      fetch(`${URL}/datasources/databases`, {
        method: 'POST',
        body: JSON.stringify(values),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      }).then(res => res.json())
        .catch(({ message }) => {
          Alert.fire("¡Ops!", message, "error");
        })
        .then(({ success, msg, item, type }) => {
          setLocalLoading(false)
          if (success) {
            Alert.fire('Genial!', msg, "success")
            setIsConnectionOk(true)
            return
          }
          if (type === 'auth') {
            removeCookie('token')
            navigate('/login')
            Alert.fire(msg, 'Ingrese nuevamente', "warning")
          } else {
            Alert.fire("¡Ops!", msg, "error");
          }
        })
    }
  }
  const handleSubmit = (values, form) => {

    submitFunctions[document.activeElement.name](values, form)

  }
  const variableInputs = {
    athena: {
      Origen: () => (
        <>
          <Input defaultValue={edit?.region || ''} placeholder='Ej: sa-east-1' required type='text' label='Region' name='region' />
          <Input defaultValue={edit?.host || ''} placeholder='Ej: s3://ahtenaResul' required type='text' label='Bucket de resultados' name='host' />
        </>
      ),
      Credenciales: () => (
        <>

          <Input defaultValue={edit?.user || ''} autoComplete="new-password" placeholder='Ingrese su usuario' required type='text' label='ID de clave de accesos' name='user' />
          <Input autoComplete="new-password" placeholder='Ingrese su contraseña' required type='password' label='Clave de acceso secreta' name='password' />
        </>
      )
    },
    knex: {
      Origen: () => (
        <>
          <Input defaultValue={edit?.host || ''} placeholder='Ej: 192.168.6.9' required type='text' label='Host' name='host' />
          <Input defaultValue={edit?.port || ''} placeholder='Ej: 3306' required type='number' label='Puerto' name='port' />
        </>
      ),
      Credenciales: () => (
        <>
          <Input defaultValue={edit?.user || ''} autoComplete="new-password" placeholder='Ingrese su usuario' required type='text' label='Usuario' name='user' />
          <Input autoComplete="new-password" placeholder='Ingrese su contraseña' required type='password' label='Contraseña' name='password' />
        </>
      )
    },
    '': {}
  }
 useUpdateEffect(()=> {
  if(closeAction === 'close') {
    cancelEdit()
    setIsConnectionOk(false)
    setInputReference('')
    setResetSelect(prev => !prev )
    
  }
 },[closeAction])

  useUpdateEffect(() => {
    if (id) {
      fetch(`${URL}/datasources/${id}`, { headers: { 'Authorization': token } }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(({ item, success, type, msg }) => {
          if (success) {
            setEdit(item)
            setInputReference(item.driver)
            return
          }

          if (type === 'auth') {
            removeCookie('token')
            navigate('/login')
            Alert.fire(msg, 'Ingrese nuevamente', "warning")
          } else {
            Alert.fire("¡Ops!", 'Algo salio mal', "error");
          }
        })
    }
  }, [id, removeCookie, navigate, token])
  useUpdateEffect(() => {
    if (!isOpen || clients.length) return
    fetch(`${URL}/datasources/clients`, { headers: { 'Authorization': token } }).then(res => res.json())
      .catch(error => console.error('Error:', error))
      .then(({ success, msg, item, type }) => {
        if (success) {
          setClients(formatOptions(item.clients.array))
          setClientMap({
            clients:item.clients.object,
            drivers: item.drivers
          })
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
  }, [isOpen,navigate, removeCookie, token, URL])

  const { Origen, Credenciales } = variableInputs[inputReference]
  return (
    <Form listenChange={['user','password','port','host','client']} onChange={()=> isConnectionOk && setIsConnectionOk(false)} onSubmit={handleSubmit}>
      <h1 className='font-bold mb-4 mx-4 pb-4 border-b border-bg text-lg self-start'>{edit ? 'Editar Origen' : 'Nuevo Origen'}</h1>
      <div>
        <h2 className='font-bold mx-3 text-base self-start'>Configuracion del origen</h2>
        <section className='grid grid-cols-2 mb-4 pb-4 border-b mx-4 border-bg'>
          <InputSelect reset={resetSelect} defaultValue={edit?.client} required type='text' options={clients} label='Cliente' name='client' onSelect={(target) => setInputReference(clientMap.drivers[clientMap.clients[target.value]] || '')} />
          <Input defaultValue={edit?.name} placeholder='Ej: Conexión MySql' required type='text' label='Nombre de la conexion' name='name' />
          {Origen && Origen()}
        </section>
        {Credenciales &&
          <>
            <h2 className='font-bold mx-3 text-base self-start'>Credenciales</h2>
            <section className='grid grid-cols-2 mb-4 pb-4 border-b mx-4 border-bg'>
              {Credenciales()}
            </section>
          </>
        }
      </div>
      <div className='flex w-full justify-end'>
       
        {edit && <button  onClick={cancelEdit} className='btn-bg' type='button'>Cancel Edit</button>}
        <button
          disabled={loading}
          className={`${loading ? 'btn-bg' : 'btn-primary'} flex items-center justify-center w-fit`}
          type='submit'
          name={isConnectionOk ? 'main-submit' : 'test-connection'}
        >
          {isConnectionOk ? (edit ? 'Guardar' : 'Crear') : 'Probar conexión'}
          {(loading || localLoading) && <Loader size={5} />}
        </button>
      </div>
    </Form>
  );
};

export default AddOrEdit;