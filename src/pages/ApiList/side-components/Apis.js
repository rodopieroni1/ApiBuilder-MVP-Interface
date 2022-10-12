import React, { useState } from 'react';
import Alert from '../../../components/libraries/Alert';
import { MdClose, MdDelete, MdDone, MdRemove } from "react-icons/md";
import useUpdateEffect from "../../../hooks/useUpdateEffect"
import Loader from '../../../components/Loader'
import TableFromQuery from '../../../components/libraries/TableFromQuery';
import { capitalize } from '../../../components/libraries/utils';
import { Form, Input, InputMultiSelect, InputSelect, SqlEditor } from '../../../components/form';
import { Portal } from 'react-portal';
import Table from '../../../components/libraries/Table';
import useCookies from 'react-cookie/cjs/useCookies';
import { useNavigate } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
const dataTypeIndetifier = (data) => {
  const dateRegex = /^(\d{4})(\/|-)(\d{1,2})(\/|-)(\d{1,2})$/
  if (dateRegex.exec(data)) {
    return 'date'
  }
  if (!isNaN(Number(data))) {
    return 'number'
  }
  return 'text'
}
const formaters = {
  singleParams: ({ data, symbol }) => `${symbol} ${data}`,
  dualParams: ({ field, data, symbol }) => `${field} ${symbol} ${data}`,
  tripleParams: ({ field, data: [data1, data2], symbol }) => `${field} ${symbol} ${data1} AND ${data2}`
}
const formatOptions = (array, property, display_name) => {
  if (!array?.length) return []
  return array.map(e => {
    const data = e[property]?.trim() || e
    const name = e[display_name]
    return { value: data, label: name || capitalize(data).replaceAll('_', ' ') }
  })
}
const Apis = ({ isOpen, setIsOpen, setLoading, loading, id, setId }) => {
  // toggles
  const navigate = useNavigate()
  const [closing, setClosing] = useState(false)
  const [resetMainSelects, setResetMainSelects] = useState(false)
  const [resetSecondarySelects, setResetSecondarySelects] = useState(false)
  const [advancedQuery, setAdvancedQuery] = useState(false)
  const [tableHasBeenSelected, setTableHasBeenSelected] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)
  // User for edit
  const [edit, setEdit] = useState({})
  const [filterIdsForDelete, setFilterIdsForDelete] = useState([])
  // Athena
  const [dataBases, setDataBases] = useState([])
  const [dataBase, setDataBase] = useState('')
  const [tables, setTables] = useState([])
  const [table, setTable] = useState('')
  const [columns, setColumns] = useState([])
  const [column, setColumn] = useState('')
  // Filters
  const [methods, setMethods] = useState([])
  const [filters, setFilters] = useState([])
  const [queryFilters, setQueryFilters] = useState([])
  const [filtersString, setFiltersString] = useState([])
  // DataSources
  const [dataSources, setDataSources] = useState([])
  const [dataSource, setDataSource] = useState('')
  // Query
  const [result, setResult] = useState('')
  const [isResultOk, setIsResultOk] = useState(false)
  const [query, setQuery] = useState('SELECT * FROM')
  const [queryErrors, setQueryErrors] = useState('')
  // Tab manager
  const [tabIndex, setTabIndex] = useState(0)

  const [cookie, , removeCookie] = useCookies()
  const token = cookie.token || ''

  const tabs = [
    {
      label: 'Table',
      component: <pre className='bg-main border h-56 p-3 border-bg overflow-x-auto rounded-lg mt-2'><TableFromQuery result={result} /></pre>
    },
    {
      label: 'JSON',
      component: <pre className='bg-bg h-56 overflow-y-auto p-3 rounded-lg  mt-2'>{result || 'Waiting for test'}</pre>
    },
  ]
  const URL = process.env.REACT_APP_BASE_URL
  const form = document.getElementsByTagName('form')[0]

  const handleQueryChange = (query) => {
    if (!query || !tables.length) return
    setIsResultOk(false)
    if(advancedQuery) return
    if ((!tableHasBeenSelected && !queryErrors.length) && !edit.query) return
    const errors = []
    const splittedQuery = query?.split(' ') || []
    const [option1, option2, option3, option4] = splittedQuery
    const flatTables = tables.map(e => e.value)
    if (option2?.toUpperCase() === 'FROM') errors.push('Necesitas seleccionar algo')
    if (option1?.toUpperCase() !== 'SELECT') errors.push('SELECT?')
    if (option3?.toUpperCase() !== 'FROM') errors.push('FROM?')
    if (!flatTables.includes(option4)) {
      setTable(option4 || '')
      errors.push(`Debes seleccionar datos de una tabla válida. Ej: ${flatTables[0]}`)
    } else {
      setTable(option4)
    }
    setQueryErrors(errors[0] || '')
    setQuery(query)
  }

  const resetForm = (localForm) => {
    localForm?.reset() || form.reset()
    setResetMainSelects(!resetMainSelects)
    setResetSecondarySelects(!resetSecondarySelects)
    setQueryFilters([])
    setQueryErrors('')
    setQuery('')
    setQueryFilters([])
    setTables([])
    setTable('')
    setDataBase('')
    setColumns([])
    setColumn([])
    setFilters([])
    setDataBase('')
    setDataBases([])
  }

  const handleClose = (name) => {
    if (name === 'close') {
      // Reset value
      resetForm()
      setAdvancedQuery(false)
      cancelEdit(form)
    }
    setClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setClosing(false)
    }, 200)
  }

  const cancelEdit = () => {
    setEdit({})
    setTables([])
    setTable('')
    setDataBase('')
    setId('')
    setResult('')
    setQuery('')
    resetForm()
    setFilters([])
    setFilterIdsForDelete([])
  }

  const testQuery = ({query, limit= 10, ...rest}) => {
    setLocalLoading(true)
    const values = {
      datasource_id: dataSource,
      database: dataBase,
      query,
      limit
    }
    fetch(`${URL}/datasources/query`, {
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
      .then(({ success, msg, items, type }) => {
        setLocalLoading(false)
        if (success) {
          setResult(JSON.stringify(items, null, 2))
          setIsResultOk(true)
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

  const functions = {
    'main-submit': (data, form) => {
      console.log(data)
      setLoading(true)
      const sql = advancedQuery ? data.query : query
      fetch(`${URL}/apis/${id}`, {
        method: id ? 'PATCH' : 'POST',
        body: JSON.stringify({ ...data, query:sql, datasource: dataSource }),
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
            resetForm(form)
            setResult('')
            setQuery('')
            cancelEdit()
            !advancedQuery && fetch(`${URL}/filters`, {
              method: 'POST',
              body: JSON.stringify(filters.filter(e => !e.id).map(e => ({ ...e, api_id: item.id }))),
              headers: {
                'Content-Type': 'application/json',
                'Authorization': token
              }
            }).then(res => res.json())
              .catch(({ message }) => {
                Alert.fire("¡Ops!", message, "error");
              })

           !advancedQuery && fetch(`${URL}/filters`, {
              method: 'DELETE',
              body: JSON.stringify(filterIdsForDelete),
              headers: {
                'Content-Type': 'application/json',
                'Authorization': token
              }
            }).then(res => res.json())
              .catch(({ message }) => {
                Alert.fire("¡Ops!", message, "error");
              })

            Alert.fire("¡Perfecto!", msg, "success");
            
            return
          }

          if (type === 'auth') {
            removeCookie('token')
            navigate('/login')
            Alert.fire(msg, 'Ingrese nuevamente', "warning")
          } else {
            Alert.fire("¡Ops!", msg, "error");
          }
        });
    },
    'test-submit': (data) => {
      data.query ? testQuery({...data}) : Alert.fire("¡Ops!", 'Tienes que escribir una peticion primero', "error");
    }
  }

  const mainSubmit = (values, form) => {
    functions[document.activeElement.id](values, form)
  }

  const secondarySubmit = (values, form) => {
    values.temp_id = uuidv4()
    setFilters(prev => [...prev, values])
    form.reset()
    setResetSecondarySelects(!resetSecondarySelects)
  }

  const handleChangeColumn = (values) => {
    setResult('')
    setColumn(values)
    setQuery(prev => {
      if (prev?.length) {
        const splittedQuery = prev.split(' ')
        splittedQuery[1] = values.length ? values : '*'
        return splittedQuery.join(' ')
      }
      return prev
    })
  }

  const handleChangeTable = (table, db, datasource) => {
    setTable(table)
    setColumns([])
    setColumn([])
    !id && setFilters([])
    setResult('')
    setQueryFilters([])
    setLocalLoading(true)
    !datasource && setQuery(prev => {
      if (prev.length) {
        const splittedQuery = prev.split(' ')
        splittedQuery[3] = table
        return splittedQuery.join(' ')
      }
      return `SELECT * FROM ${table}`
    })

    if (!table) return
    const values = {
      datasource_id: datasource|| dataSource,
      database: db || dataBase,
      table
    }
    fetch(`${URL}/datasources/columns`, {
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
      .then(({ success, msg, items, type }) => {
        setLoading(false)
        setLocalLoading(false)
        if (success) {
          const columns = Object.keys(items[0]).map(e => {
            return { field: e, type: dataTypeIndetifier(items[0][e]) }
          })
          setColumns(columns)
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

    setQueryErrors('')
    setTableHasBeenSelected(true)
  }

  const handleChangeDatabase = (db, datasource) => {
    setResult('')
    setTables([])
    setTable('')
    !id && setFilters([])
    setQueryFilters([])
    setColumns([])
    setColumn([])
    setLocalLoading(true)
    setDataBase(db)
    const values = {
      datasource_id: datasource || dataSource,
      database: db
    }
    fetch(`${URL}/datasources/tables`, {
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
      .then(({ success, msg, items, type }) => {
        setLoading(false)
        setLocalLoading(false)
        if (success) {
          const property = Object.keys(items[0])[0]
          setTables(formatOptions(items, property))

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

  const handleChangeDataSource = (datasource_id) => {
    setDataSource(datasource_id)
    setDataBase('')
    setDataBases([])
    setResult('')
    setTables([])
    setTable('')
    !id && setFilters([])
    setQueryFilters([])
    setColumns([])
    setColumn([])
    setLocalLoading(true)
    const values = {
      datasource_id
    }
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
      .then(({ success, msg, items, type }) => {
        setLoading(false)
        setLocalLoading(false)
        if (success) {
          const property = Object.keys(items[0])[0]
          setDataBases(formatOptions(items, property).filter(({ value }) => value !== 'default'))
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

  useUpdateEffect(() => {
    handleQueryChange(query)
  }, [tables])
  
  useUpdateEffect(() => {
    setFiltersString((queryFilters.map((e, i) => (!i ? ' WHERE ' : '') + e.query).join(' AND ')))
    setResult('')
  }, [queryFilters])

  // Obtener objeto a editar
  useUpdateEffect(() => {
    resetForm()
    if (id) {
      fetch(`${URL}/apis/${id}`, { headers: { 'Authorization': token } }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(({ item, success, type, msg }) => {
          if (success) {
            const {datasource, database, table, query} = item
            handleChangeDataSource(datasource)
            handleChangeDatabase(database,datasource)
            handleChangeTable(table,database,datasource)
            setResult('')
            setEdit(item)
            setAdvancedQuery(item.advanced_query)
            setQuery(query)
            setColumn(query?.split(' ')[1].split(','))
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
      fetch(`${URL}/apis/filters/${id}`, { headers: { 'Authorization': token } }).then(res => res.json())
      .catch(error => console.error('Error:', error))
      .then(({ items, success, type, msg }) => {
        if (success) {
          setFilters(items)
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
  }, [id, removeCookie, navigate])

  // Obtener metodos 
  useUpdateEffect(() => {
    if(!isOpen) return
    fetch(`${URL}/filters/methods`, { headers: { 'Authorization': token } }).then(res => res.json())
      .catch(error => console.error('Error:', error))
      .then(({ success, type, item, msg }) => {
        if (success) {
          setMethods(item)
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

  }, [isOpen,URL, navigate, removeCookie, token])

  // Obtener origenes
  useUpdateEffect(() => {
    if(!isOpen) return
    fetch(`${URL}/dataSources`, { headers: { 'Authorization': token } }).then(res => res.json())
      .catch(error => console.error('Error:', error))
      .then(({ success, msg, items, type }) => {
        if (success) {
          setDataSources(formatOptions(items, 'id', 'name'))
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
  }, [isOpen,URL, removeCookie, navigate, token])

  
  
  const deleteFilter = ({ temp_id, id }) => {
    id && setFilterIdsForDelete(prev => [...prev, id])
    setFilters(prev => prev.filter(e => id !== e.id || temp_id !== e.temp_id))
    setQueryFilters(prev => prev.filter(e => e.id !== id))

  }

  const tableColumns = [
    {
      label: 'Nombre',
      property: 'name'
    },
    {
      label: 'Campo',
      property: 'field'
    },
    {
      label: 'Operador',
      property: 'operator',
      cell: (data) => methods.object[data].display_name
    },
    {
      label: 'Dato',
      className: 'hover:bg-main',
      cell: (data, i) => {
        const method = methods.object[data.operator]
        const type = columns.find(({ field }) => field === data.field)?.type || 'text'
        const formater = formaters[method.formater]
        const handleChange = ({ name }) => {
          if (!queryFilters.find(e => e.name === name)) return
          setQueryFilters(prev => prev.filter(e => e.name !== name))
        }
        const onSubmit = (values) => {
          if (queryFilters.find(e => e.name === data.name)) return
          if (!values[data.name]) return
          const value = values[data.name]
          const filter = {
            name: data.name,
            data: values[data.name],
            query: formater({ ...method, data: type === 'text' ? `'${value}'` : value, field: data.field }),
            id: data.id || data.temp_id
          }
          setQueryFilters(prev => [...prev, filter])
        }
        return (
          <Form onSubmit={onSubmit}>
            <div className='flex rounded-lg bg-bg px-2 w-full'>
              <input type={type} defaultValue={queryFilters[i]?.data} className='bg-bg w-full focus:outline-none' onChange={({ target }) => handleChange(target)} placeholder='Escribe aquí' name={data.name} />
              <button className='bg-bg border-l border-main pl-1' type='submit'><MdDone /></button>
            </div>
          </Form>
        )
      }
    },
    {
      label: 'Acciones',
      center: true,
      cell: (data) => <button onClick={() => deleteFilter(data)} className='px-5 py-2 w-full h-full flex justify-center text-danger items-center' type='button'>Borrar <MdDelete /></button>
    }
  ]


  return (
    <div className={`animate__animated ${isOpen ? (closing ? 'animate__fadeOut' : 'animate__fadeIn') : 'hidden'} w-screen h-screen flex flex-col items-center justify-center absolute bg-bg top-0 right-0 bg-opacity-90 z-10 p-5`}>
      <div className={`animate__animated ${closing ? 'animate__zoomOut' : 'animate__zoomIn'} h-full my-10 w-4/6 bg-main rounded-lg overflow-y-auto `}>
        <Form name='form' onSubmit={mainSubmit} className='p-5'>
          <div className='flex w-fit absolute right-5'>
            <button onClick={(e) => handleClose(e.currentTarget.name)} type='button' name='minimize' className=' font-extrabold p-2 hover:bg-bg rounded-lg'><MdRemove /></button>
            <button onClick={(e) => handleClose(e.currentTarget.name)} type='button' name='close' className=' font-extrabold p-2 hover:bg-bg rounded-lg'><MdClose /></button>
          </div>
          <button onClick={(e) => handleClose(e.currentTarget.name)} type='button' name='close' className='absolute right-5 font-extrabold p-2 hover:bg-bg rounded-lg'><MdClose /></button>
          <button onClick={(e) => handleClose(e.currentTarget.name)} type='button' name='close' className='absolute right-5 font-extrabold p-2 hover:bg-bg rounded-lg'><MdClose /></button>
          <h1 className='font-bold m-3 text-lg self-start'>{id ? 'Editar API' : 'Nueva API'}</h1>

          <div className='border-t border-b border-bg py-2 mx-2'>
            <h2 className='font-bold mx-3 text-base self-start'>Configurar tabla</h2>
            <div className={`grid grid-cols-1 ${advancedQuery ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-2 w-full`}>
              <InputSelect disabled={localLoading || id} reset={resetMainSelects} onSelect={e => { handleChangeDataSource(e.value) }} defaultValue={edit?.datasource} options={dataSources} type='text' required label='Origen de datos' name='datasource_id' placeholder='Elije una opcion' />
              <InputSelect disabled={localLoading || id} reset={resetMainSelects} onSelect={e => { handleChangeDatabase(e.value) }} defaultValue={edit?.database} options={dataBases} type='text' required label='Base de datos' name='database' placeholder='Elije una opcion' />
              <InputSelect disabled={localLoading || id} reset={resetMainSelects} onSelect={e => { handleChangeTable(e.value) }} defaultValue={table || edit?.table} options={tables} type='text' required label='Tabla' name='table' placeholder='Elije una opcion' />
              {!advancedQuery && <InputMultiSelect disabled={localLoading} reset={resetMainSelects} onSelect={values => { handleChangeColumn(values) }} defaultValue={column} options={formatOptions(columns, 'field')} type='text' required label='Columnas' name='columns' placeholder='Todas' />}
            </div>
          </div>

          <div id='sub_form' />


          <div className='flex flex-col mt-2'>
            <h2 className='font-bold mx-5 text-base self-start py-2'>Editor Sql</h2>
            {queryErrors && <span className='text-danger bg-danger-light rounded-lg font-medium px-2'>{queryErrors}</span>}
            <div className='bg-bg p-1 rounded-lg my-2'>
              <div className='flex items-center bg-bg rounded-lg focus:outline-none px-3  py-1 w-fit'>
                <input disabled={edit.advanced_query} onChange={e => setAdvancedQuery(e.target.checked)} type="checkbox" name='advanced_query' checked={advancedQuery} />
                <label className='text-sm font font-semibold mx-1'>Consulta avanzada</label>
              </div>
              <div className='h-56 overflow-y-auto overflow-x-hidden'>
                <SqlEditor readOnly={!advancedQuery} query={query + (advancedQuery ? '' : filtersString)} table={table} onChange={handleQueryChange} name='query' />
              </div>
            </div>
          </div>


          <div className='flex flex-col md:flex-row w-full'>
            <Input type='number' name='limit' placeholder="Es 10 por defecto" defaultValue={edit?.limit} label='Limite' />
            <Input type='text' required={isResultOk} name='author' placeholder="ej: Daniel" defaultValue={edit?.author} label='Autor' />
          </div>


          <div className='mb-4'>
            {
              tabs[tabIndex].component
            }
            <div className='mx-4'>
              {
                tabs.map((e, i) => <button key={e.label + i} type='button' onClick={() => setTabIndex(i)} className={`px-4 border-b border-x rounded-b-lg border-bg text-sm hover:text-primary ${i === tabIndex && 'font-bold'}`}>{e.label}</button>)
              }
            </div>
          </div>

          <div className='border-t border-bg py-2 my-2'>
            <h2 className='font-bold mx-3 text-base self-start'>Datos endpoint</h2>
            <div className='flex flex-col md:flex-row w-full'>
              <Input type='text' required={isResultOk} name='name' placeholder='ej: Productions' defaultValue={edit?.name} label='Nombre' />
              <Input type='text' required={isResultOk} name='endpoint' placeholder='ej: /productions' template='/' defaultValue={edit?.endpoint} label='Ruta de contexto' />
            </div>
          </div>

          <div className='flex w-full justify-end'>
            {id && <button onClick={cancelEdit} className='btn-bg' type='button'>Cancel Edit</button>}
            <button
              disabled={queryErrors}
              className={`${queryErrors ? 'btn-bg' : 'btn-primary'} flex items-center justify-center`}
              type='submit'
              id='test-submit'>
              Probar query {(loading || localLoading) && <Loader size={5} />}
            </button>

            <button
              disabled={queryErrors ||  !isResultOk}
              className={`${(queryErrors ||  !isResultOk) ? 'btn-bg' : 'btn-primary'} flex items-center justify-center`}
              type='submit'
              id='main-submit'>
              {id ? 'Guardar' : 'Crear'} {(loading || localLoading) && <Loader size={5} />}
            </button>
          </div>

        </Form>

        {(!advancedQuery && table && !queryErrors) ?
          <Portal node={document && document.getElementById('sub_form')}>
            <div className='border-b border-bg my-2 py-2'>
              <Form onSubmit={secondarySubmit}>
                <div className='m-2'>
                  <h2 className='font-bold mx-3 text-base self-start'>Agregar filtros</h2>
                  <div className='grid grid-cols-1 lg:grid-cols-3 gap-2 w-full'>
                    <InputSelect reset={resetSecondarySelects} options={formatOptions(methods.array, 'name', 'display_name')} required type='text' label='Metodo' name='operator' placeholder='Elije una opcion' />
                    <InputSelect reset={resetSecondarySelects} options={formatOptions(columns, 'field')} required type='text' label='Columna' name='field' placeholder='Elije una opcion' />
                    <Input name='name' label='Nombre' required placeholder='Ej: buscar-provincia' />
                  </div>
                  <div className='flex w-full justify-end'>
                    <button className={`btn-primary flex items-center justify-center`} type='submit'>Añadir filtro{loading && <Loader size={5} />}</button>
                  </div>
                </div>

              </Form>
              <div className='bg-main border h-56 border-bg overflow-x-auto rounded-lg my-2 py-2'>
                <Table data={filters} columns={tableColumns} />
              </div>
            </div>
          </Portal>
          : null}

      </div>
    </div>
  );
};

export default Apis;