<script lang="ts">
    import { onMount } from "svelte";

    const RADIUS = 64;
    const HUES = [224, 240, 256, 272, 288];

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let maskCanvas: HTMLCanvasElement;
    let maskCtx: CanvasRenderingContext2D;
    let maskImage: HTMLImageElement;
    let mouseX = 0;
    let mouseY = 0;
    let time = 0;

    function drawMask() {
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

        const canvasAspect = maskCanvas.width / maskCanvas.height;
        const imageAspect = maskImage.width / maskImage.height;

        let srcX = 0,
            srcY = 0,
            srcWidth = maskImage.width,
            srcHeight = maskImage.height;

        if (imageAspect > canvasAspect) {
            // Imagem mais larga que o canvas → recorta horizontalmente
            srcWidth = maskImage.height * canvasAspect;
            srcX = (maskImage.width - srcWidth) / 2;
        } else {
            // Imagem mais alta que o canvas → recorta verticalmente
            srcHeight = maskImage.width / canvasAspect;
            srcY = (maskImage.height - srcHeight) / 2;
        }

        maskCtx.drawImage(
            maskImage,
            srcX,
            srcY,
            srcWidth,
            srcHeight, // recorte da imagem original
            0,
            0,
            maskCanvas.width,
            maskCanvas.height // destino no canvas
        );

        const imgData = maskCtx.getImageData(
            0,
            0,
            maskCanvas.width,
            maskCanvas.height
        );
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
            const brightness = data[i]; // tons de cinza
            data[i + 3] = brightness; // usa o brilho como canal alfa
        }

        maskCtx.putImageData(imgData, 0, 0);
    }

    function draw() {
        time += 1;
        const width = (canvas.width = window.innerWidth);
        const height = (canvas.height = window.innerHeight);

        ctx.clearRect(0, 0, width, height);
        ctx.globalAlpha = 0.1; // opacidade bem baixa
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(maskCanvas, 0, 0, width, height);
        ctx.globalAlpha = 1.0; // volta ao normal

        const t = (time / 60) % HUES.length; // controla a velocidade (maior = mais lento)
        const index = Math.floor(t);
        const nextIndex = (index + 1) % HUES.length;
        const lerp = t - index;

        const easedLerp = (1 - Math.cos(Math.PI * lerp)) / 2;
        const hue = HUES[index] + (HUES[nextIndex] - HUES[index]) * easedLerp;
        const gradient = ctx.createRadialGradient(
            mouseX,
            mouseY,
            0,
            mouseX,
            mouseY,
            RADIUS
        );
        gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.8)`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, 70%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Aplica a máscara
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(maskCanvas, 0, 0, width, height);
        ctx.globalCompositeOperation = "source-over";

        requestAnimationFrame(draw);
    }

    function handleMouseMove(event: MouseEvent) {
        mouseX = event.clientX;
        mouseY = event.clientY;
    }

    onMount(() => {
        ctx = canvas.getContext("2d")!;
        maskCanvas = document.createElement("canvas");
        maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true })!;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            maskCanvas.width = canvas.width;
            maskCanvas.height = canvas.height;
            drawMask();
        }

        maskImage = new Image();
        maskImage.src = "/circuit.webp"; // ou .png
        maskImage.onload = () => {
            resize(); // garante que a imagem é desenhada no tamanho certo
            draw();
        };
    });
</script>

<svelte:window on:resize={drawMask} on:mousemove={handleMouseMove} />

<canvas bind:this={canvas}></canvas>
<h1>HAIL TO THE KING</h1>
<a href="https://letmegooglethat.com/" target="_blank">Goto Google, you dork</a>

<style>
    h1 {
        color: white;
        font-size: 64px;
    }
    a {
        color: deeppink;
    }

    canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: black;
        display: block;
        mix-blend-mode: screen;
        z-index: 0; /* visível, mas atrás dos demais elementos com z-index > 0 */
        pointer-events: none; /* permite clicar nos elementos acima */
    }
</style>
