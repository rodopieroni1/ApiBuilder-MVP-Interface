import React, { useState } from 'react';
import Alert from '../../../components/libraries/Alert';
import TableFromQuery from '../../../components/libraries/TableFromQuery';
import { MdClose } from "react-icons/md";
import Loader from "../../../components/Loader"
import useCookies from 'react-cookie/cjs/useCookies';
import { useNavigate } from 'react-router';

const QueryViewer = ({viewerData, setViewerData}) => {
  const [closing, setClosing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [tabIndex, setTabIndex] = useState(0)
  const URL = process.env.REACT_APP_BASE_URL
  const [cookie,,removeCookie] = useCookies()
  const navigate = useNavigate()
  const token = cookie.token || ''
  const tabs = [
    {
      label: 'Table',
      component: <pre className='bg-main border h-full p-3 border-bg overflow-x-auto rounded-lg mt-2'><TableFromQuery result={result}/></pre> 
    },
    {
      label: 'JSON',
      component: <pre className='bg-bg h-full overflow-y-auto p-3 rounded-lg  mt-2'>{result || 'Waiting for test'}</pre>
    },
  ]
  const handleClose = () => {
    setClosing(true)
    setTimeout(()=> {
      setViewerData(false)
      setResult('')
      setClosing(false)
    },200)
  }

  const testQuery = ({datasource, query, database, limit}) => {
      const values = {
        datasource_id:datasource ,
        query,
        database,
        limit     
      }

    setLoading(true)
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
        setLoading(false)
        if (success) {
          setResult(JSON.stringify(items, null, 2))
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


  
  return (
    <div id='bg' onClick={(e)=> { if (e.target.id) handleClose()}} className={`animate__animated ${viewerData ? ( closing ? 'animate__fadeOut' : 'animate__fadeIn') : 'hidden'} w-screen h-screen flex flex-col items-center justify-center absolute bg-bg top-0 right-0 bg-opacity-90 z-10`}>
      <div className={`animate__animated ${closing ? 'animate__zoomOut' : 'animate__zoomIn' } bg-main p-5 rounded-lg flex flex-col w-11/12 lg:w-2/3 xl:w-3/6 h-2/3 relative`}>
        <button type='button' id='close' className='absolute right-5 font-extrabold p-2 hover:bg-bg rounded-lg'><MdClose id='icon'/></button>
        <h1 className='font-bold m-3 text-lg self-start'>{viewerData.name || 'No se cargó una query'}</h1>
        <pre className='bg-bg h-full overflow-y-auto overflow-x-hidden p-3 rounded-lg my-2'>{viewerData.query || 'Sql preview'}</pre>
        {
          tabs[tabIndex].component
        }
        <div className='mx-4'>
          {
            tabs.map((e,i) => <button key={e.label+i} type='button' onClick={()=> setTabIndex(i)} className='px-4 border-b border-x rounded-b-lg border-bg text-sm '>{e.label}</button>)
          }
        </div>
        <button onClick={()=> 
          testQuery(viewerData)} className={`flex items-center justify-center ${result ? 'btn-bg': 'btn-primary'}`}  disabled={result} type='submit'>Probar query {loading && <Loader size={5}/>}</button>
      </div>
    </div>
  );
};

export default QueryViewer;