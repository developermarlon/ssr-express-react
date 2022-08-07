import "./example.scss";
import Users from "../components/Users";
import { Helmet } from "react-helmet";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    localStorage.setItem("token", "123");
    console.log(localStorage.getItem("token"));
  }, []);

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Example</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>
      <h1>Example {1 + 1}</h1>
      <Users />
    </>
  );
}
