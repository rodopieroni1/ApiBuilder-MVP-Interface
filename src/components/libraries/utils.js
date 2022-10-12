export const capitalize = (string) => {
    if (typeof string !== 'string') return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
export const isObject = (obj) => {
  if (Object.prototype.toString.call(obj) === '[object Object]') return true;
  return false;
}
export const isJSON = str => {
  try {
    const json = JSON.parse(str);
    if (json && isObject(json)) return true;
  } catch (e) {
    return false;
  }
  return false;
};

export const formatOptions= (array, value, display_name) => {
  if (!array?.length) return []
  return array.map(e => {
    const data = e[value]?.trim() || e
    const name = e[display_name] || e
    return {value: data, label: name ||  capitalize(data).replaceAll('_', ' ')}
  })
}