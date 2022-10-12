import Router from "./router";
import Navigation from "./components/commons/Navigation";
import 'animate.css'
import Loader from "./components/Loader"
import { Suspense } from "react";
function App() {
  return (
    <div className="text-text bg-bg grid grid-cols-12 h-screen">
      <Suspense fallback={<Loader/>}>
        <Navigation/>
        <Router/>
      </Suspense>
    </div>
  );
}

export default App;

