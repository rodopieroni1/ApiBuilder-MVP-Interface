import React, { useEffect, useState } from 'react';
import Table from './Table';
import { capitalize } from './utils';
const TableFromQuery = ({ result }) => {
    const [parsedData, setParsedData] = useState([])
    const [columns, setColumns] = useState([])
    useEffect(() => {
        const parsedResult= JSON.parse(result || '[]')
        if (parsedResult.length) {
            const keys= Object.keys(parsedResult[0])
            const data = parsedResult.map(e => {
                return keys.reduce((a,c,i) => ({...a, [c || `Columna ${i+1}`]: e[c]}),{})
            })
            if (data[0]) {
                const columns = Object.keys(data[0])?.map(e => ({ label: capitalize(e), property: e}))
                setParsedData(data)
                setColumns(columns)
            }
        } else {
            setParsedData([])
            setColumns([])
        }
    }, [result])
    return (
        <Table columns={columns} data={parsedData} />
    );
};

export default TableFromQuery;