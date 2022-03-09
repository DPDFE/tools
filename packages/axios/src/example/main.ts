import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
<h1>Hello Vite!</h1>
<button onclick="fetchData()">fetch data</button>
<a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`;
