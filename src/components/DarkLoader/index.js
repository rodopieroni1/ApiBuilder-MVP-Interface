import './index.css'
const DarkLoader = ({size}) => <div className={`lds-dual-ring ${size ? `after:w-${size} after:h-${size}` : 'after:w-14 after:h-14'}`}/>

export default DarkLoader;