// --- CORE FUNCTION: DRAGGABLE ---
function refreshDraggable() {
    // 1. Matikan semua drag yang ada dulu (biar ga numpuk)
    cardList.forEach(c => {
        if (c._drag) {
            // Draggable.create() returns an array, but we normalize to store
            // a single instance on the element. Handle both cases defensively.
            try {
                if (Array.isArray(c._drag)) {
                    c._drag.forEach(d => d && d.kill && d.kill());
                } else if (c._drag.kill) {
                    c._drag.kill();
                }
            } catch (e) {
                // ignore and continue - defensive
            }
            c._drag = null;
        }
    });

    // 2. Ambil kartu paling atas (Index terakhir)
    const topCard = cardList[cardList.length - 1];
    if(!topCard) return;

    // 3. Bikin Draggable baru
    // Create and capture the instance (Draggable.create returns an array)
    const created = Draggable.create(topCard, {
        type: "x,y",
        edgeResistance: 0.65,
        bounds: CONTAINER,
        inertia: true,
        onDrag: function() {
            // Miringkan
            gsap.to(this.target, { rotation: this.x * 0.05, duration: 0.1 });
        },
        onRelease: function() {
            const threshold = 100;
            if(Math.abs(this.x) > threshold || Math.abs(this.y) > threshold) {
                throwCard(this.target, this.x, this.y);
            } else {
                // Snap Back
                gsap.to(this.target, { x: 0, y: 0, rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
            }
        }
    });

    // Store the first instance (normalize to single instance)
    try {
        topCard._drag = (created && created[0]) || Draggable.get(topCard) || null;
    } catch (e) {
        topCard._drag = Draggable.get(topCard) || null;
    }
}

// --- CORE FUNCTION: THROW & RESTACK ---
function throwCard(card, velX, velY) {
    // 1. Matikan Drag
    if (card._drag) {
        try {
            if (Array.isArray(card._drag)) {
                card._drag.forEach(d => d && d.disable && d.disable());
            } else if (card._drag.disable) {
                card._drag.disable();
            }
        } catch (e) {
            // ignore
        }
    }

    // 2. Animasi Lempar
    gsap.to(card, {
        x: velX * 5,
        y: velY * 5 + 500,
        rotation: velX * 0.1,
        duration: 0.5,
        opacity: 0,
        ease: "power1.in",
        onComplete: () => {
            // 3. Hapus kartu dari DOM & Array
            card.remove();
            // Hapus dari array (kita cari indexnya biar aman)
            const index = cardList.indexOf(card);
            if(index > -1) cardList.splice(index, 1);

            // 4. Tambah kartu baru di belakang
            addCardToBottom();

            // 5. Animasi Restack (Semua kartu geser maju)
            updateStack(0.6);
        }
    });
}