import "./example.scss";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

export default function Home() {
  let navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      // navigate("/example", { replace: true });
    }, 3000);
  }, []);

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Home</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>
      <h1>Home</h1>
    </>
  );
}
