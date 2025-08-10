// Variables para el canvas
const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');

// Variables para el fondo del espacio
let spaceStars = [];
const maxSpaceStars = 200;
let nebulaParticles = [];
const maxNebulaParticles = 50;

// Variables para el texto
let currentText = '';
let fullText = "Y a tu lado nada me falta ya\nSi está nublado, el Sol vuelve a brillar\nEs la magia de tu amor\nQue me llena de alegría\nAmor, mi amuleto eres tú";
let textIndex = 0;
let typewriterSpeed = 100;
let lastTypeTime = 0;
let currentLine = 0;
let lineDelays = [2500, 2000, 3000, 0, 0]; // 2.5s, 2s, 3s, 0s, 0s
let waitingForNextLine = false;
let userClicked = false;
let clickTime = 0;

// Variables para el corazón
let heartLines = [];
const heartLineCount = 50;
let heartDrawingProgress = 0;
let heartPhase = 'waiting';
let heartBeatTime = 0;
let heartScale = 1;

// Variables para la animación final
let showEndAnimation = false;
let endAnimationStartTime = 0;
let fadeOutProgress = 0;
let teAmoText = '';
let teAmoIndex = 0;

// Variables para el audio
let loveSong = null;
let audioStartTime = 0;

// Función para inicializar el audio
function initAudio() {
    try {
        console.log('🎵 Inicializando audio...');
        
        // Obtener el elemento de audio
        loveSong = document.getElementById('loveSound');
        console.log('🎵 Elemento de audio encontrado:', loveSong);
        
        // Configurar el audio
        if (loveSong) {
            loveSong.volume = 0.7;
            loveSong.loop = false; // NO repetir, se detiene cuando termina
            
            // Eventos del audio
            loveSong.addEventListener('loadeddata', () => {
                console.log('✅ Audio cargado y listo');
            });
            
            loveSong.addEventListener('error', (e) => {
                console.error('❌ Error al cargar el audio:', e);
            });
            
            console.log('🎵 Audio configurado correctamente');
        }
        
    } catch (e) {
        console.error('❌ Error al inicializar audio:', e);
    }
}

// Función para reproducir la canción de amor
function playLoveSong() {
    if (loveSong) {
        loveSong.play()
            .then(() => {
                console.log('🎵 Música reproduciéndose');
                if (!audioStartTime) {
                    audioStartTime = Date.now();
                }
            })
            .catch(error => {
                console.error('❌ Error al reproducir:', error);
            });
    }
}

// Función para pausar la canción
function pauseLoveSong() {
    if (loveSong) {
        loveSong.pause();
        console.log('⏸️ Música pausada');
    }
}

// Función para mapear valores
function map(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

// Clase para estrellas del espacio
class SpaceStar {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.brightness = Math.random() * 0.8 + 0.2;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.color = Math.random() > 0.7 ? 'rgba(255, 255, 255, 1)' : 
                    Math.random() > 0.5 ? 'rgba(173, 216, 230, 1)' : 
                    'rgba(255, 255, 255, 0.8)';
    }
    
    update() {
        this.twinklePhase += this.twinkleSpeed;
    }
    
    draw() {
        const twinkle = Math.sin(this.twinklePhase) * 0.3 + 0.7;
        ctx.save();
        ctx.globalAlpha = this.brightness * twinkle;
        ctx.fillStyle = this.color;
        
        // Estrella con destellos
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Destello adicional para estrellas brillantes
        if (this.brightness > 0.6) {
            ctx.globalAlpha = this.brightness * twinkle * 0.3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// Clase para partículas de nebulosa
class NebulaParticle {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 100 + 50;
        this.alpha = Math.random() * 0.1 + 0.05;
        this.color = Math.random() > 0.5 ? 'rgba(138, 43, 226, 1)' : 'rgba(70, 130, 180, 1)';
        this.driftSpeed = Math.random() * 0.2 + 0.1;
        this.driftDirection = Math.random() * Math.PI * 2;
    }
    
    update() {
        // Movimiento lento de deriva
        this.x += Math.cos(this.driftDirection) * this.driftSpeed;
        this.y += Math.sin(this.driftDirection) * this.driftSpeed;
        
        // Mantener dentro de los límites
        if (this.x < -this.size) this.x = canvas.width + this.size;
        if (this.x > canvas.width + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = canvas.height + this.size;
        if (this.y > canvas.height + this.size) this.y = -this.size;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Crear gradiente radial para la nebulosa
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color.replace('1)', '0.3)'));
        gradient.addColorStop(1, this.color.replace('1)', '0)'));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Función para crear estrellas del espacio
function createSpaceBackground() {
    spaceStars = [];
    nebulaParticles = [];
    
    // Calcular el número de partículas basado en el tamaño de la pantalla
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    
    let maxSpaceStars = 100; // Por defecto para desktop
    let maxNebulaParticles = 30;
    
    if (isSmallMobile) {
        maxSpaceStars = 40; // Muy pocas para móviles pequeños
        maxNebulaParticles = 15;
    } else if (isMobile) {
        maxSpaceStars = 60; // Mediano para móviles
        maxNebulaParticles = 20;
    }
    
    // Crear estrellas del espacio
    for (let i = 0; i < maxSpaceStars; i++) {
        spaceStars.push(new SpaceStar());
    }
    
    // Crear partículas de nebulosa
    for (let i = 0; i < maxNebulaParticles; i++) {
        nebulaParticles.push(new NebulaParticle());
    }
}

// Función para actualizar y dibujar el fondo del espacio
function updateSpaceBackground() {
    // Fondo oscuro sólido para evitar parpadeo
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Actualizar y dibujar nebulosas primero (más atrás)
    nebulaParticles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    // Actualizar y dibujar estrellas (encima de las nebulosas)
    spaceStars.forEach(star => {
        star.update();
        star.draw();
    });
}

// Función para iniciar la animación final
function startEndAnimation() {
    showEndAnimation = true;
    endAnimationStartTime = Date.now();
    fadeOutProgress = 0;
    teAmoText = ''; // Inicializado como vacío
    teAmoIndex = 0;
    
    // Hacer que el audio se repita SOLO cuando empiece la animación final
    if (loveSong) {
        loveSong.loop = true; // Activar loop solo para la animación final
        loveSong.currentTime = 0; // Reiniciar desde el principio
        loveSong.play(); // Reproducir
        console.log('🎵 Audio en loop para la animación final');
    }
}

// Función para el efecto de máquina de escribir
function updateTypewriter() {
    if (!userClicked) return;
    
    const currentTime = Date.now();
    if (currentTime - clickTime < 1500) return; // Esperar 1.5 segundos
    
    if (textIndex === 0) {
        heartPhase = 'drawing';
    }
    
    if (textIndex === 1) {
        setTimeout(() => playLoveSong(), 100);
    }
    
    // Si estamos esperando la siguiente línea, no hacer nada
    if (waitingForNextLine) return;
    
    // Escribir la siguiente letra
    if (textIndex < fullText.length && currentTime - lastTypeTime > typewriterSpeed) {
        currentText += fullText[textIndex];
        textIndex++;
        lastTypeTime = currentTime;
        
        // Debug: mostrar progreso cada 10 letras
        if (textIndex % 10 === 0) {
            console.log(`📝 Progreso: ${textIndex}/${fullText.length} - Línea actual: ${currentLine + 1}`);
        }
        
        // Si encontramos un salto de línea, activar el delay
        if (fullText[textIndex - 1] === '\n') {
            currentLine++;
            const delay = lineDelays[currentLine] || 0;
            if (delay > 0) {
                waitingForNextLine = true;
                console.log(`⏸️ Línea ${currentLine + 1} completada, esperando ${delay}ms`);
                setTimeout(() => {
                    waitingForNextLine = false;
                    console.log(`🚀 Continuando con línea ${currentLine + 1}`);
                }, delay);
            } else {
                console.log(`🚀 Línea ${currentLine + 1} completada, continuando sin delay`);
            }
        }
    }
}

// Función para dibujar el poema
function drawPoem() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Calcular el tamaño del texto basado en el tamaño de la pantalla
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    
    let fontSize = 18; // Tamaño por defecto para desktop
    let lineHeight = 25;
    let shadowBlur = 20;
    let shadowOffset = 3;
    
    if (isSmallMobile) {
        fontSize = 12;
        lineHeight = 18;
        shadowBlur = 15;
        shadowOffset = 2;
    } else if (isMobile) {
        fontSize = 14;
        lineHeight = 22;
        shadowBlur = 18;
        shadowOffset = 2.5;
    }
    
    // Configuración del texto
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Sombra del texto
    ctx.shadowColor = 'rgba(255, 20, 147, 0.9)';
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = shadowOffset;
    ctx.shadowOffsetY = shadowOffset;
    
    // Dividir el texto en líneas y dibujar cada una
    const lines = currentText.split('\n');
    const startY = centerY - (lines.length * lineHeight) / 2;
    
    lines.forEach((line, index) => {
        if (line.trim()) {
            const y = startY + index * lineHeight;
            ctx.fillText(line, centerX, y);
        }
    });
    
    // Cursor parpadeante solo si no hemos terminado
    if (textIndex < fullText.length) {
        const cursorTime = Date.now() * 0.01;
        const cursorAlpha = Math.sin(cursorTime) > 0 ? 1 : 0;
        
        if (cursorAlpha > 0) {
            ctx.fillStyle = 'rgba(255, 20, 147, 0.8)';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            // Calcular posición del cursor
            const currentLineText = currentText.split('\n').pop() || '';
            const cursorX = centerX + (ctx.measureText(currentLineText).width / 2);
            const cursorY = startY + (lines.length - 1) * lineHeight;
            
            // Dibujar cursor
            ctx.fillRect(cursorX, cursorY - fontSize/2, 2, fontSize);
        }
    }
    
    // Restaurar sombra
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

// Función para dibujar la animación final
function drawEndAnimation() {
    if (!showEndAnimation) return;
    
    const elapsed = Date.now() - endAnimationStartTime;
    
    // Calcular el tamaño del texto basado en el tamaño de la pantalla
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    
    let fontSize = 72; // Tamaño por defecto para desktop
    let lineHeight = 80;
    
    if (isSmallMobile) {
        fontSize = 32;
        lineHeight = 40;
    } else if (isMobile) {
        fontSize = 48;
        lineHeight = 60;
    }
    
    // Fade out elegante y sofisticado
    if (elapsed < 4000) {
        fadeOutProgress = elapsed / 4000;
        const alpha = fadeOutProgress * 0.95;
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        // Fondo negro elegante con sutiles estrellas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.98)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Estrellas sutiles y elegantes
        drawElegantStars(elapsed);
        
        // Efecto de máquina de escribir elegante para "TE AMOOO"
        if (elapsed > 4500) {
            const typeTime = elapsed - 4500;
            const targetLength = Math.floor(typeTime / 120); // Más lento y elegante
            teAmoText = "TE AMOOO".substring(0, Math.min(targetLength, "TE AMOOO".length));
            
            if (teAmoText.length === "TE AMOOO".length) {
                // Texto completo - Efectos elegantes y románticos
                const pulseTime = (elapsed - 6000) * 0.002;
                const pulse = Math.sin(pulseTime) * 0.15 + 1; // Pulso más sutil
                
                // Sombra elegante y profunda
                ctx.shadowColor = 'rgba(255, 20, 147, 0.6)';
                ctx.shadowBlur = 40;
                ctx.shadowOffsetX = 8;
                ctx.shadowOffsetY = 8;
                
                // Texto principal con gradiente elegante
                const gradient = ctx.createLinearGradient(
                    canvas.width / 2 - 200, 0,
                    canvas.width / 2 + 200, 0
                );
                gradient.addColorStop(0, 'rgba(255, 20, 147, 1)');      // Rosa intenso
                gradient.addColorStop(0.3, 'rgba(255, 105, 180, 1)');   // Rosa claro
                gradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');   // Blanco puro
                gradient.addColorStop(0.7, 'rgba(255, 105, 180, 1)');   // Rosa claro
                gradient.addColorStop(1, 'rgba(255, 20, 147, 1)');      // Rosa intenso
                
                ctx.fillStyle = gradient;
                ctx.font = `bold ${fontSize * pulse}px "Playfair Display", "Times New Roman", serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(teAmoText, canvas.width / 2, canvas.height / 2);
                
                // Efecto de brillo interior sutil
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.font = `bold ${fontSize * pulse * 0.85}px "Playfair Display", "Times New Roman", serif`;
                ctx.fillText(teAmoText, canvas.width / 2, canvas.height / 2);
                
                // Pétalos de rosa flotantes elegantes
                drawElegantRosePetals(elapsed);
                
                // Corazones sutiles y románticos
                drawRomanticHearts(elapsed);
                
            } else {
                // Texto en proceso de escritura con estilo elegante
                const writeProgress = teAmoText.length / "TE AMOOO".length;
                const glowIntensity = Math.sin(elapsed * 0.008) * 0.3 + 0.7; // Glow más sutil
                
                // Sombra elegante durante la escritura
                ctx.shadowColor = 'rgba(255, 20, 147, 0.5)';
                ctx.shadowBlur = 30 + glowIntensity * 15;
                ctx.shadowOffsetX = 5;
                ctx.shadowOffsetY = 5;
                
                // Gradiente elegante durante la escritura
                const writeGradient = ctx.createLinearGradient(
                    canvas.width / 2 - 150, 0,
                    canvas.width / 2 + 150, 0
                );
                writeGradient.addColorStop(0, 'rgba(255, 20, 147, 1)');
                writeGradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
                writeGradient.addColorStop(1, 'rgba(255, 20, 147, 1)');
                
                ctx.fillStyle = writeGradient;
                ctx.font = `bold ${fontSize}px "Playfair Display", "Times New Roman", serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(teAmoText, canvas.width / 2, canvas.height / 2);
            }
        }
    }
    
    // Resetear sombra
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

// Función para dibujar estrellas elegantes y sutiles
function drawElegantStars(elapsed) {
    const starCount = 25; // Menos estrellas, más elegante
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    for (let i = 0; i < starCount; i++) {
        const angle = (i / starCount) * Math.PI * 2 + elapsed * 0.0003; // Movimiento más lento
        const radius = 120 + Math.sin(elapsed * 0.0008 + i) * 40; // Radio más estable
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        const twinkle = Math.sin(elapsed * 0.001 + i * 0.3) * 0.4 + 0.6; // Twinkle más sutil
        const size = (Math.sin(elapsed * 0.0008 + i) * 0.3 + 0.7) * 2; // Tamaño más estable
        
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.6})`; // Transparencia más sutil
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Destello muy sutil
        if (twinkle > 0.8) {
            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.2})`;
            ctx.beginPath();
            ctx.arc(x, y, size * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Función para dibujar pétalos de rosa elegantes
function drawElegantRosePetals(elapsed) {
    const petalCount = 20;
    
    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2 + elapsed * 0.0006;
        const radius = 180 + Math.sin(elapsed * 0.001 + i) * 60;
        const x = canvas.width / 2 + Math.cos(angle) * radius;
        const y = canvas.height / 2 + Math.sin(angle) * radius;
        
        const alpha = 0.2 + Math.sin(elapsed * 0.002 + i) * 0.15; // Transparencia más sutil
        const size = 3 + Math.sin(elapsed * 0.001 + i) * 1.5;
        
        // Colores de rosa elegantes y sutiles
        const colors = [
            'rgba(255, 20, 147, ' + alpha + ')',    // Rosa intenso
            'rgba(255, 105, 180, ' + alpha + ')',   // Rosa claro
            'rgba(219, 112, 147, ' + alpha + ')'    // Rosa pálido
        ];
        
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Función para dibujar corazones románticos y sutiles
function drawRomanticHearts(elapsed) {
    const heartCount = 12; // Menos corazones, más elegante
    
    for (let i = 0; i < heartCount; i++) {
        const angle = (i / heartCount) * Math.PI * 2 + elapsed * 0.0005;
        const radius = 160 + Math.sin(elapsed * 0.001 + i) * 50;
        const x = canvas.width / 2 + Math.cos(angle) * radius;
        const y = canvas.height / 2 + Math.sin(angle) * radius;
        
        const scale = 0.25 + Math.sin(elapsed * 0.0015 + i) * 0.15; // Escala más sutil
        const alpha = 0.3 + Math.sin(elapsed * 0.002 + i) * 0.2; // Transparencia más sutil
        
        drawElegantMiniHeart(x, y, scale, alpha);
    }
}

// Función para dibujar un corazón pequeño elegante
function drawElegantMiniHeart(x, y, scale, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;
    
    // Gradiente sutil para el corazón
    const heartGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
    heartGradient.addColorStop(0, 'rgba(255, 20, 147, 1)');
    heartGradient.addColorStop(1, 'rgba(255, 105, 180, 0.8)');
    
    ctx.fillStyle = heartGradient;
    ctx.beginPath();
    
    // Dibujar corazón pequeño con forma más elegante
    const heartSize = 25;
    for (let i = 0; i < 25; i++) {
        const t = (i / 24) * Math.PI * 2;
        const px = 16 * Math.pow(Math.sin(t), 3) * heartSize / 25;
        const py = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * heartSize / 25;
        
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

// Función para crear las líneas del corazón
function createHeartLines() {
    heartLines = [];
    
    // Calcular el tamaño del corazón basado en el tamaño de la pantalla
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    
    let scaleFactor = 25; // Tamaño por defecto para desktop
    
    if (isSmallMobile) {
        scaleFactor = 15; // Muy pequeño para móviles pequeños
    } else if (isMobile) {
        scaleFactor = 20; // Mediano para móviles
    }
    
    for (let i = 0; i < heartLineCount; i++) {
        const t = (i / (heartLineCount - 1)) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        const scaledX = (x * scaleFactor) + canvas.width / 2;
        const scaledY = (y * scaleFactor) + canvas.height / 2;
        
        heartLines.push({
            x: scaledX,
            y: scaledY,
            originalX: scaledX,
            originalY: scaledY,
            progress: 0,
            alpha: 0,
            thickness: Math.random() * 3 + 2,
            color: `hsl(${330 + Math.random() * 30}, 100%, 70%)`
        });
    }
}

// Función para dibujar el corazón con líneas de neón
function drawHeart() {
    if (heartPhase === 'waiting') return;
    
    ctx.save();
    
    // Conectar las líneas para formar el corazón
    ctx.beginPath();
    let firstPoint = true;
    
    heartLines.forEach((line, index) => {
        if (line.progress > 0) {
            if (firstPoint) {
                ctx.moveTo(line.x, line.y);
                firstPoint = false;
            } else {
                ctx.lineTo(line.x, line.y);
            }
        }
    });
    
    // Cerrar el camino si está completo
    if (heartDrawingProgress > 0.9) {
        ctx.closePath();
    }
    
    // Efecto de neón grueso
    if (heartPhase === 'drawing') {
        // Durante el dibujo: líneas individuales con neón intenso
        heartLines.forEach((line, index) => {
            if (line.progress > 0) {
                // Sombra exterior para efecto neón MÁS INTENSO
                ctx.shadowColor = line.color;
                ctx.shadowBlur = 20; // Aumentado de 15 a 20
                ctx.strokeStyle = line.color;
                ctx.lineWidth = line.thickness + 1; // Líneas un poco más gruesas
                ctx.globalAlpha = line.alpha;
                
                // Dibujar línea individual
                ctx.beginPath();
                if (index === 0) {
                    ctx.moveTo(line.x, line.y);
                } else {
                    const prevLine = heartLines[index - 1];
                    if (prevLine.progress > 0) {
                        ctx.moveTo(prevLine.x, prevLine.y);
                        ctx.lineTo(line.x, line.y);
                    }
                }
                ctx.stroke();
            }
        });
    } else if (heartPhase === 'beating') {
        // Durante el latido: SOLO LÍNEAS con neón pulsante intenso
        ctx.shadowColor = 'rgba(255, 20, 147, 1)'; // Brillo más intenso
        ctx.shadowBlur = 25 + Math.sin(heartBeatTime * 0.003) * 15; // Más brillo y más lento
        ctx.strokeStyle = 'rgba(255, 20, 147, 1)';
        ctx.lineWidth = 5; // Líneas más gruesas
        ctx.globalAlpha = 1; // Máxima opacidad
        ctx.stroke();
        
        // NO hay relleno - solo líneas de neón
    }
    
    ctx.restore();
}

// Función para actualizar el corazón
function updateHeart() {
    if (heartPhase === 'waiting') return;
    
    if (heartPhase === 'drawing') {
        // Dibujar línea por línea - MUCHO MÁS LENTO
        heartDrawingProgress += 0.004; // Reducido de 0.008 a 0.004 para que sea mucho más lento
        
        heartLines.forEach((line, index) => {
            const targetProgress = index / heartLineCount;
            if (heartDrawingProgress >= targetProgress) {
                line.progress = Math.min(1, (heartDrawingProgress - targetProgress) * 1.5); // Reducido de 2 a 1.5
                line.alpha = line.progress;
            }
        });
        
        // Cuando termine de dibujarse, cambiar a fase de latido
        if (heartDrawingProgress >= 1) {
            heartPhase = 'beating';
            heartBeatTime = Date.now();
            console.log('💖 Corazón dibujado, iniciando latido...');
        }
        
    } else if (heartPhase === 'beating') {
        // Durante el latido: corazón completo con neón pulsante - SIN MOVIMIENTO
        heartBeatTime = Date.now();
        const beat = Math.sin(heartBeatTime * 0.003) * 0.03 + 1; // Más lento y menos escala
        heartScale = beat;
        // NO hay rotación - el corazón se queda quieto
        
        // Aplicar solo escala a las líneas (sin rotación)
        heartLines.forEach(line => {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            // Calcular posición relativa al centro
            const relX = line.originalX - centerX;
            const relY = line.originalY - centerY;
            
            // Solo aplicar escala, sin rotación
            line.x = centerX + relX * heartScale;
            line.y = centerY + relY * heartScale;
        });
    }
}

function animate() {
    // Limpiar el canvas completamente en cada frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updateTypewriter();
    updateSpaceBackground();
    updateHeart();
    drawHeart();
    
    if ((loveSong && loveSong.ended && !showEndAnimation) || 
        (loveSong && !showEndAnimation && loveSong.currentTime > 0 && 
         (Date.now() - (audioStartTime || Date.now())) > 25000)) {
        startEndAnimation();
    }
    
    drawPoem();
    drawEndAnimation();
    requestAnimationFrame(animate);
}

// Función para manejar clics en el canvas
function handleCanvasClick(event) {
    if (!userClicked) {
        userClicked = true;
        clickTime = Date.now();
        console.log('💖 Iniciando animación...');
    }
}

// Función para manejar el estado de la página
function handlePageVisibilityChange() {
    if (document.hidden) {
        pauseLoveSong();
    } else {
        if (textIndex > 0 && textIndex < fullText.length) {
            playLoveSong();
        }
    }
}

function handleWindowFocus() {
    if (textIndex > 0 && textIndex < fullText.length) {
        playLoveSong();
    }
}

function handleWindowBlur() {
    pauseLoveSong();
}

// Función para probar el audio manualmente
function testAudio() {
    console.log('🧪 Probando audio manualmente...');
    if (loveSong) {
        console.log('📊 Estado del audio:', loveSong.readyState);
        console.log('📊 Duración:', loveSong.duration);
        console.log('📊 Tiempo actual:', loveSong.currentTime);
        console.log('📊 Pausado:', loveSong.paused);
        console.log('📊 Volumen:', loveSong.volume);
        
        // Intentar reproducir
        playLoveSong();
    } else {
        console.error('❌ No hay elemento de audio');
    }
}

// Configurar el canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Event listeners
canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('visibilitychange', handlePageVisibilityChange);
window.addEventListener('focus', handleWindowFocus);
window.addEventListener('blur', handleWindowBlur);
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createHeartLines();
    createSpaceBackground();
});

// Función para manejar eventos táctiles
function handleTouchStart(event) {
    event.preventDefault(); // Prevenir zoom
    handleCanvasClick(event);
}

// Inicializar
initAudio();
createHeartLines();
createSpaceBackground();
animate();