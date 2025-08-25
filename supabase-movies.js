// Configuración de Supabase
const supabaseUrl = 'https://rxzftiapimrwlvnnppeg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4emZ0aWFwaW1yd2x2bm5wcGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDc1MjcsImV4cCI6MjA3MTcyMzUyN30.pkWs-omaGxgXq5gVNdHHfGYJ-pVXMAOGJR6vYaSBptQ';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Función para cargar listas desde Supabase
async function cargarLista(tabla, ulSelector, isSeries = false) {
    const { data, error } = await supabase.from(tabla).select('*');
    const ul = document.querySelector(ulSelector);
    ul.innerHTML = '';
    if (data) {
        data.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="title">${item.titulo}</span>`;
            // Botón para mover de pendientes a vistas
            if (tabla === 'pendientes') {
                const btn = document.createElement('button');
                btn.className = 'mark-viewed';
                btn.textContent = 'Marcar como vista';
                btn.onclick = async () => {
                    await supabase.from('pendientes').delete().eq('id', item.id);
                    await supabase.from('vistas').insert([{ titulo: item.titulo, tipo: item.tipo }]);
                    cargarTodo();
                };
                li.appendChild(btn);
            }
            ul.appendChild(li);
        });
    }
}

// Función para cargar todas las listas
function cargarTodo() {
    cargarLista('vistas', '#vistas-peliculas .gallery');
    cargarLista('vistas_series', '#vistas-series .gallery', true);
    cargarLista('pendientes', '#pendientes-peliculas .gallery');
    cargarLista('pendientes_series', '#pendientes-series .gallery', true);
}

// Inicializa
cargarTodo();