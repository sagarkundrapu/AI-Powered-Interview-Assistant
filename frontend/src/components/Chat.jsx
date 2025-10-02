import React,{useState, useEffect} from 'react'

const Chat = ({token}) => {
    const [response, setResponse] = useState({});

 useEffect(() => {
  const fetchData = async () => {
    try {
      const baseUrl = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/interview/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setResponse(data);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  fetchData();
}, []);
  return (
    <div>Chat</div>
  )
}

export default Chat