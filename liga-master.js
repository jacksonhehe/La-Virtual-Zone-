const clubs = [
  {
    name: 'Rayo Digital FC',
    coach: 'DT Ficticio',
    budget: 20,
    link: 'liga-master/club/rayo-digital-fc.html'
  },
  {
    name: 'Atlético Pixelado',
    coach: 'DT Pixel',
    budget: 22,
    link: 'liga-master/club/atletico-pixelado.html'
  }
];

function renderClubs() {
  const container = document.getElementById('clubs');
  if (!container) return;
  const list = document.createElement('ul');
  clubs.forEach(c => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${c.name}</strong> - DT: ${c.coach} - Presupuesto: $${c.budget}M ` +
      `<a href="${c.link}">Ver club</a>`;
    list.appendChild(li);
  });
  container.appendChild(list);
}

document.addEventListener('DOMContentLoaded', renderClubs);
