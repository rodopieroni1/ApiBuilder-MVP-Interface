import pages from '../pages'

const routes = Object.keys(pages).map((e,i) => {
    const Component = pages[e]?.component ? pages[e].component : pages[e]
    const {
        title = e,
        params = '',
        privated = false
    } = pages[e]
    return ({
        route: (i ? `/${e.toLowerCase().replaceAll(' ', '-')}/` : '/'),
        as: e,
        Component,
        position: i,
        params,
        title,
        privated
    })
})
console.log(routes)
export default routes