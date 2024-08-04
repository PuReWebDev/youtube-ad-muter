// import React from './libs/react.development.js';
// import ReactDOM from './libs/react-dom.development.js';

// function App() {
//   return (
//     <div>
//       <h1>YouTube Ad Muter</h1>
//       <p>This extension mutes YouTube ads and skips them when possible.</p>
//     </div>
//   );
// }

document.addEventListener('DOMContentLoaded', function () {
  const adMuteData = JSON.parse(localStorage.getItem('adMuteData')) || {};
  const tableBody = document.querySelector('#adMuteTable tbody');

  Object.keys(adMuteData).forEach(url => {
    const { count, entries } = adMuteData[url];
    entries.forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${url}</td>
        <td>${entry.timestamp}</td>
        <td>${entry.pageTitle}</td>
        <td>${count}</td>
      `;
      tableBody.appendChild(row);
    });
  });

  // Initialize DataTable
  $('#adMuteTable').DataTable({
    "pageLength": 50
  });
});

// ReactDOM.render(<App />, document.getElementById('root'));