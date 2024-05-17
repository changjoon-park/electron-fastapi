fetch("http://localhost:4040/")
  .then((response) => response.json()) // Convert the response to JSON
  .then((data) => {
    console.log("Success:", data); // Log data to console
    document.getElementById(
      "apiMessage"
    ).innerText = `${data.status} (${data.ip}:${data.port})`; // Update text in the HTML
  })
  .catch((error) => {
    console.error("Error:", error); // Handle any errors
    document.getElementById("apiMessage").innerText = "Failed to load data"; // Display error message
  });
