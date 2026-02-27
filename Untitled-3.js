// 1. Definisikan hubungan antar Node (Source ID -> Target ID)
const connections = [
    { from: 'node-discovery', to: 'node-concept' },
    { from: 'node-discovery', to: 'node-design' },
    { from: 'node-discovery', to: 'node-develop' },
    { from: 'node-concept',   to: 'node-polish' }, // Concept gabung ke Polish (via Design flow scr visual)
    { from: 'node-design',    to: 'node-polish' },
    { from: 'node-develop',   to: 'node-polish' },
    { from: 'node-polish',    to: 'node-launch' }
];

const canvas = document.getElementById('canvas');
const svgLayer = document.getElementById('connections-layer');

// 2. Fungsi Membuat Garis SVG
function drawConnections() {
    // Bersihkan garis lama
    svgLayer.innerHTML = '';

    connections.forEach(conn => {
        const fromNode = document.getElementById(conn.from);
        const toNode = document.getElementById(conn.to);

        if (!fromNode || !toNode) return;

        // Hitung posisi titik tengah sisi kanan (Source) dan sisi kiri (Target)
        const fromRect = fromNode.getBoundingClientRect();
        const toRect = toNode.getBoundingClientRect();

        // Titik Awal (Kanan box pengirim)
        const x1 = fromRect.right;
        const y1 = fromRect.top + (fromRect.height / 2);

        // Titik Akhir (Kiri box penerima)
        const x2 = toRect.left;
        const y2 = toRect.top + (toRect.height / 2);

        // Hitung Control Points untuk Kurva Bezier (Supaya melengkung halus)
        // Kurva akan melengkung sejauh 50% jarak horizontal
        const curvature = Math.abs(x2 - x1) * 0.5; 

        // Syntax SVG Path: M = Move to, C = Cubic Bezier
        const pathData = `
            M ${x1} ${y1} 
            C ${x1 + curvature} ${y1}, 
              ${x2 - curvature} ${y2}, 
              ${x2} ${y2}
        `;

        // Buat elemen Path
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.setAttribute("class", "connector");
        svgLayer.appendChild(path);
    });
}

// 3. Fungsi Drag and Drop Logic
function makeDraggable(element) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    element.addEventListener('mousedown', (e) => {
        isDragging = true;
        
        // Ambil posisi mouse awal
        startX = e.clientX;
        startY = e.clientY;

        // Ambil posisi elemen saat ini (parsing angka dari style "100px")
        const rect = element.getBoundingClientRect();
        initialLeft = element.offsetLeft;
        initialTop = element.offsetTop;

        element.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        e.preventDefault();

        // Hitung pergeseran
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        // Set posisi baru
        element.style.left = `${initialLeft + dx}px`;
        element.style.top = `${initialTop + dy}px`;

        // UPDATE GARIS SECARA REAL-TIME SAAT DIGESER
        drawConnections();
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'grab';
        }
    });
}

// 4. Inisialisasi
document.querySelectorAll('.node').forEach(node => {
    makeDraggable(node);
});

// Gambar garis pertama kali saat load
window.addEventListener('load', drawConnections);
// Update garis jika window di-resize
window.addEventListener('resize', drawConnections);