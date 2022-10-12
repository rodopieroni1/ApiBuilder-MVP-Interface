import React from 'react';

const useIsMounted = () => {
  const isMounted = React.useRef(false);

  React.useEffect(function setIsMounted() {
    isMounted.current = true;

    return function cleanupSetIsMounted() {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
};
/**
 * A custom useEffect hook that only triggers on updates, not on initial mount
 * @param {Function} effect
 * @param {Array<any>} dependencies
 */
 

 const useUpdateEffect = (effect, dependencies) => {
    const isMounted = useIsMounted();
    const isInitialMount = React.useRef(true);
  
    React.useEffect(() => {
        let effectCleanupFunc = function noop() {};
        if (isInitialMount.current) {
          isInitialMount.current = false;
        } else {
          effectCleanupFunc = effect() || effectCleanupFunc;
        }
        let mountedRefValue = isMounted.current
        return () => {
          effectCleanupFunc();
          if (!mountedRefValue) {
            isInitialMount.current = true;
          }
        };
      }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
  };


export default useUpdateEffect