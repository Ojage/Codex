import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat-container');
const textArea = document.querySelector("textarea[name='prompt']");


let loadInterval;
textArea.focus();

const loader = (element) => {
	element.textContent = '';

	loadInterval = setInterval(() => {
		element.textContent += '.';

		if (element.textContent.length > 3) {
			element.textContent = '';
		}
	}, 300);
}

const typeText = (element, text) => {
	let index = 0;
	let interval = setInterval(() => {
		if (index < text.length) {
			element.textContent += text.charAt(index);
			index++;
		} else {
			clearInterval(interval);
		}
	}, 20);
}

const generateUniqueId = () => {
	const timeStamp = Date.now();
	const randomNum = Math.floor(Math.random() * 1000);
	const hexadecimal = randomNum.toString(16);

	return `id-${timeStamp}-${hexadecimal}`;
}

const chatStripe = (isAi, value, uniqueId) => `
    <div class="wrapper ${isAi ? 'ai' : 'user'}">
      <div class="chat">
        <div class="profile">
            <img src="${isAi ? bot : user}" alt="${
            isAi ? 'bot' : 'user'
          }" />
        </div>
        <div class="message" id="${uniqueId}">
          <p>${value}</p>
        </div>
      </div>
    </div>
  `;

const handleSubmit = async (e) => {
  e.preventDefault();
  form.reset();
  const data = new FormData(form);
  const prompt = data.get("prompt");
  // generate the users chat stripe
  chatContainer.innerHTML += chatStripe(false, prompt);
  
  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, '', uniqueId);

  // scroll to the bottom of the chat container
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from the server
  const response = await fetch('https://codex-m1ft.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: data.get('prompt')
        }),
      })

        clearInterval(loadInterval);
        messageDiv.textContent =  '';

        if (response.ok) {
          const data = await response.json();
          const parsedData = data.bot.trim();

          typeText(messageDiv, parsedData);
        } else {
          const err = await response.text();

          messageDiv.textContent = "Something went wrong";
          alert(err);
        }

        
}

form.onsubmit = handleSubmit;
form.onkeyup = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(e);
    }
};
