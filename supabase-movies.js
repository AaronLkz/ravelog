// Configuración de Supabase
const supabaseUrl = 'https://rxzftiapimrwlvnnppeg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4emZ0aWFwaW1yd2x2bm5wcGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDc1MjcsImV4cCI6MjA3MTcyMzUyN30.pkWs-omaGxgXq5gVNdHHfGYJ-pVXMAOGJR6vYaSBptQ';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Función para cargar listas desde Supabase
async function cargarLista(tabla, ulSelector) {
    const { data, error } = await supabase.from(tabla).select('*');
    if (error) {
        console.error(`Error cargando ${tabla}:`, error.message);
    }
    const ul = document.querySelector(ulSelector);
    ul.innerHTML = '';
    if (data) {
        data.forEach(item => {
            const tieneLink = !!item.rave_link;
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="title">${item.titulo}</span>
                <a 
                    class="rave-btn${tieneLink ? '' : ' disabled'}"
                    href="${tieneLink ? item.rave_link : '#'}"
                    target="_blank" rel="noopener"
                    ${tieneLink ? '' : 'tabindex="-1" aria-disabled="true"'}
                >Ver en Rave</a>
            `;
            ul.appendChild(li);
        });
    }
}

// Función para cargar todas las listas
async function cargarTodo() {
    await Promise.all([
        cargarLista('vistas', '#vistas-peliculas .gallery'),
        cargarLista('vistas_series', '#vistas-series .gallery'),
        cargarLista('pendientes', '#pendientes-peliculas .gallery'),
        cargarLista('pendientes_series', '#pendientes-series .gallery')
    ]);
    // Llama a agregarCaratulas después de actualizar las listas
    if (window.agregarCaratulas) {
        window.agregarCaratulas();
    }
}

// Inicializa
cargarTodo();