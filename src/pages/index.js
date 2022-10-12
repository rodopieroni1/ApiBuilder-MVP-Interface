import ApiList from "./ApiList"
import DataSources from "./DataSources"

const pages = {
    'Recursos': {
        component: ApiList,
        title: 'Listado de recursos',
    },
    'Origenes':{
        component: DataSources,
        title: 'Listado de origenes de datos',
    },
    // sample:{
    //     component: sample,
    //     title: 'This is a sample component'
    //     params:':text'
    // },
}
export default pages