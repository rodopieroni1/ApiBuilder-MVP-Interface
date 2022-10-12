import React, { useEffect, useState } from 'react';
import { capitalize, isObject } from './utils';
import { v4 as uuidv4 } from 'uuid';
const Table = ({ data=[], columns }) => {
  const [stateColumns, setStateColumns] = useState(columns)
  const [stateData, setStateData] = useState(data)
  useEffect(()=> {
    if(data?.length){
      const dataForTable = data.map(e => {
        return Object.keys(data[0]).reduce((a,c,i) => ({...a, [c || `Columna ${i+1}`]: e[c]}),{})
      })
      setStateData(dataForTable)
      if(!columns) {
        setStateColumns(Object.keys(dataForTable[0])?.map((e,i) => {
          const key = e || `Columna ${i+1}`
          return { label: capitalize(key), property: key}
        })) 
      }
    }
  
  },[data, columns])
  return (
    !data.length ? <p className='w-full h-full justify-center flex items-center'>No hay datos</p> :
    
    <table className='w-full'>
      <thead>
        <tr className='border-b border-bg'>
          {(columns || stateColumns)?.map(({ label, center }, i) => <th key={uuidv4()} className={`px-5 py-2 ${center ? 'text-center flex justify-center' : 'text-left'} hover:bg-bg`}>{label}</th>)}
        </tr>
      </thead>
      <tbody>
        {stateData?.map((e,index)=> (
          <tr key={uuidv4()} className='border-b border-bg'>
            {(columns || stateColumns)?.map(({ property, cell, max_length, center, label, className }, i) => {
              if (property) {
                const data = (cell ? cell(e[property], index) : e[property]) ?? ''
                if (isObject(e[property])) return <td>Object</td>
                return (
                  <td key={uuidv4()} className={`${className || 'px-5 py-2 hover:bg-bg'}  ${center ? 'text-center flex justify-center' : 'text-left'}`}>{data.length > max_length ? data.slice(0, max_length) + '..' : data}</td>
                )
              }
              if (cell) return <td key={uuidv4()} className={`${className || 'hover:bg-bg'} ${center ? 'text-center' : 'text-left'}`}>{cell(e,index)}</td>
              return null
            })}
          </tr>
        ))}
      </tbody>
    </table>

  );
};

export default Table;


  // const data= [
  //   {name: 'Transporte', endpoint: '/j', query: 'SELECT * FROM batch_transport', author: 'Guille'},
  //   {name: 'Personas', endpoint: '/predro', query: 'SELECT * FROM batch_person', author: 'Guille'},
  //   {name: 'Transporte', endpoint: '/j', query: 'SELECT * FROM batch_transport', author: 'Guille'},
  //   {name: 'Personas', endpoint: '/predro', query: 'SELECT * FROM batch_person', author: 'Guille'},
  // ]
  // const columns = [
  //   {
  //     label: 'Nombre',
  //     property: 'name', // works with nested items too, person.data.name
  //     cell: (data) => <p>{data}</p> //optional, for specify the render of this particular cell
  //   },
  //   {
  //     label: 'Ruta de contexto',
  //     property: 'endpoint'
  //   },
  //   {
  //     label: 'Creador',
  //     property: 'author'
  //   },
  //   {
  //     label: 'Query',
  //     property: 'query'
  //   },
  // ]