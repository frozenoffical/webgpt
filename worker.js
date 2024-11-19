const apiUrl = "https://darkness.ashlynn.workers.dev/chat/?prompt=";

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const { pathname } = new URL(request.url);

    if (pathname === "/") {
        return new Response(getHtml(), { headers: { 'Content-Type': 'text/html' } });
    }

    if (pathname === "/sendMessage") {
        try {
            const { prompt } = await request.json();
            const response = await fetch(`${apiUrl}${encodeURIComponent(prompt)}&model=gpt-4o-mini`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error("API response was not OK");
            const data = await response.json();
            const botMessage = data.response || "No response received.";

            return new Response(JSON.stringify({ botMessage }), { headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error("Fetch error:", error);
            return new Response(JSON.stringify({ error: "Unable to fetch response." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    }

    return new Response("Not Found", { status: 404 });
}

function getHtml() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ChatGPT Web App</title>
        <style>
            @keyframes gradient {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: linear-gradient(-45deg, #ff6b6b, #f06595, #f8e71c, #1d9bf0);
                background-size: 400% 400%;
                animation: gradient 15s ease infinite;
                color: #333;
            }

            .chat-container {
                display: flex;
                flex-direction: column;
                width: 100%;
                max-width: 600px;
                height: 70vh;
                overflow-y: auto;
                padding: 1em;
                background-color: rgba(255, 255, 255, 0.9);
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                margin-top: 2em;
            }

            .chat-bubble {
                padding: 12px 20px;
                margin: 5px 0;
                border-radius: 15px;
                max-width: 80%;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                animation: fadeIn 0.3s ease-out;
            }
            .user {
                align-self: flex-end;
                background-color: #1d9bf0;
                color: white;
            }
            .bot {
                align-self: flex-start;
                background: #f1f1f1;
            }

            .input-container {
                display: flex;
                width: 100%;
                max-width: 600px;
                padding: 10px;
                position: absolute;
                bottom: 60px;
            }

            .input-container input {
                flex-grow: 1;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 25px;
                font-size: 1em;
                outline: none;
                margin-right: 10px;
                transition: border-color 0.3s ease;
            }
            .input-container input:focus {
                border-color: #1d9bf0;
            }

            .input-container button {
                padding: 15px 20px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-size: 1em;
                transition: background 0.3s ease, transform 0.2s ease;
            }
            .input-container button:hover {
                background: #388e3c;
                transform: scale(1.05);
            }

            .footer-bubble {
                background-color: rgba(255, 255, 255, 0.9);
                color: #007bff;
                padding: 10px 15px;
                border-radius: 15px;
                font-size: 0.9em;
                text-align: center;
                margin-top: 1em;
                max-width: fit-content;
                position: absolute;
                bottom: 10px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            .footer-bubble a {
                color: #007bff;
                text-decoration: none;
                font-weight: bold;
            }
            .footer-bubble a:hover {
                text-decoration: underline;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .typing-indicator {
                display: flex;
                gap: 5px;
                justify-content: flex-start;
                align-items: center;
                margin-top: 10px;
                animation: fadeIn 0.5s ease-in-out;
            }

            .typing-bubble {
                width: 10px;
                height: 10px;
                background-color: #ddd;
                border-radius: 50%;
                animation: bounce 1.5s infinite ease-in-out;
            }

            .typing-bubble:nth-child(2) {
                animation-delay: 0.3s;
            }

            .typing-bubble:nth-child(3) {
                animation-delay: 0.6s;
            }

            @keyframes bounce {
                0%, 80%, 100% {
                    transform: scale(0);
                }
                40% {
                    transform: scale(1);
                }
            }
        </style>
    </head>
    <body>
        <div class="chat-container" id="chat-container"></div>
        <div id="typing-indicator" class="typing-indicator" style="display: none;">
            <div class="typing-bubble"></div>
            <div class="typing-bubble"></div>
            <div class="typing-bubble"></div>
        </div>
        <div class="input-container">
            <input type="text" id="user-input" placeholder="Type your message..."/>
            <button onclick="sendMessage()">Send</button>
        </div>
        <div class="footer-bubble">
            <a href="https://t.me/FroZzeN_xD" target="_blank">Developed by Frozen</a>
        </div>
        <script>
            const chatContainer = document.getElementById("chat-container");
            const typingIndicator = document.getElementById("typing-indicator");
            const userInput = document.getElementById("user-input");

            userInput.addEventListener("keydown", function(event) {
                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                }
            });

            function appendMessage(text, isBot) {
                const message = document.createElement("div");
                message.className = "chat-bubble " + (isBot ? "bot" : "user");
                message.innerText = text;
                chatContainer.appendChild(message);
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }

            async function sendMessage() {
                const userMessage = userInput.value.trim();
                if (!userMessage) return;

                appendMessage(userMessage, false);
                userInput.value = "";

                // Show typing indicator
                typingIndicator.style.display = "flex";

                try {
                    const response = await fetch("/sendMessage", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ prompt: userMessage })
                    });

                    if (!response.ok) throw new Error("Network response was not OK");

                    const data = await response.json();
                    const botMessage = data.botMessage || "No response received.";
                    appendMessage(botMessage, true);
                } catch (error) {
                    console.error("Error fetching message:", error);
                    appendMessage("Error: Unable to fetch response.", true);
                } finally {
                    // Hide typing indicator after the response
                    typingIndicator.style.display = "none";
                }
            }
        </script>
    </body>
    </html>`;
}

