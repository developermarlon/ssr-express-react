import {useEffect, useState } from 'react';

export default () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
      fetch('https://jsonplaceholder.typicode.com/users')
      .then(response => response.json())
      .then(json => setUsers(json));
  }, []);

  if(users.length === 0) return <div>Loading users...</div>;
  return users.map(user => <div key={user.id}>{user.name}</div>);
}