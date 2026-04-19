
console.log("JS LOADED");

fetch('http://192.168.8.105:3000/api/status')
.then(res => res.json())
.then(data => {
    console.log("DATA:", data);

    const apsDiv = document.getElementById("aps");
    apsDiv.innerHTML = "";

    data.devices.forEach(device => {
        const card = document.createElement("div");
        card.className = "card " + device.status;

        card.innerHTML = `
            <h3>${device.name}</h3>
            <p>IP: ${device.ip}</p>
            <p>Status: ${device.status}</p>
        `;

        apsDiv.appendChild(card);
    });
})
.catch(err => console.error("ERROR:", err));