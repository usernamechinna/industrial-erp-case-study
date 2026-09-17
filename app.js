const API_URL = 'https://v2.jokeapi.dev/joke/Any?safe-mode&type=single,twopart';

const jokeButton = document.querySelector('#joke-button');
const buttonLabel = document.querySelector('#button-label');
const jokeContent = document.querySelector('#joke-content');
const category = document.querySelector('#category');
const copyButton = document.querySelector('#copy-button');
const errorMessage = document.querySelector('#error-message');

let currentJoke = '';

function renderJoke(joke) {
  currentJoke = joke.type === 'twopart' ? `${joke.setup}\n\n${joke.delivery}` : joke.joke;
  category.textContent = `${joke.category.toUpperCase()} · ${joke.type === 'twopart' ? 'TWO-PART' : 'ONE-LINER'}`;
  jokeContent.innerHTML = joke.type === 'twopart'
    ? `<div><p class="joke-text">${escapeHtml(joke.setup)}</p><p class="joke-delivery">${escapeHtml(joke.delivery)}</p></div>`
    : `<p class="joke-text">${escapeHtml(joke.joke)}</p>`;
  copyButton.disabled = false;
}

function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = value;
  return element.innerHTML;
}

async function getJoke() {
  jokeButton.disabled = true;
  buttonLabel.textContent = 'Finding a joke…';
  errorMessage.hidden = true;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('The joke service is unavailable.');
    const joke = await response.json();
    if (joke.error) throw new Error(joke.message || 'The joke service returned an error.');
    renderJoke(joke);
  } catch (error) {
    errorMessage.textContent = `${error.message} Please try again.`;
    errorMessage.hidden = false;
  } finally {
    jokeButton.disabled = false;
    buttonLabel.textContent = 'Get another joke';
  }
}

async function copyJoke() {
  if (!currentJoke) return;
  try {
    await navigator.clipboard.writeText(currentJoke);
    const original = copyButton.textContent;
    copyButton.textContent = '✓';
    copyButton.title = 'Copied!';
    setTimeout(() => { copyButton.textContent = original; copyButton.title = 'Copy joke'; }, 1200);
  } catch {
    errorMessage.textContent = 'Could not copy the joke. Select the text manually instead.';
    errorMessage.hidden = false;
  }
}

jokeButton.addEventListener('click', getJoke);
copyButton.addEventListener('click', copyJoke);
