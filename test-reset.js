const email = "test@example.com";
fetch(`http://localhost:3000/api.php?action=forgot_password`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({ email })
}).then(async res => {
  const json = await res.json();
  console.log("Status:", res.status);
  console.log("JSON:", json);
}).catch(console.error);
