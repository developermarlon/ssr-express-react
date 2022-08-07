import { Link, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Example from "./pages/Example";

export function App() {
  let location = useLocation();

  useEffect(() => {
    console.log(location);
  }, [location.pathname]);

  return (
    <>
      <nav>
        <ul>
          <li key="link-home">
            <Link to="/home">Home</Link>
          </li>
          <li key="link-example">
            <Link to="/example">Example</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route key="/" path="/" element={<Home />}></Route>
        <Route key="/home" path="/home" element={<Home />}></Route>
        <Route key="/example" path="/example" element={<Example />}></Route>
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </>
  );
}
