<script lang="ts">
    import { onMount } from "svelte";

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let width = 0;
    let height = 0;

    let mouseX = 0;
    let mouseY = 0;

    const RADIUS = 100;
    const HUES = [224, 240, 256, 272, 288];
    let time = 0;

    let maskCanvas: HTMLCanvasElement;
    let maskCtx: CanvasRenderingContext2D;
    let maskImage: HTMLImageElement;

    function createMaskFromImage() {
        maskCanvas.width = maskImage.width;
        maskCanvas.height = maskImage.height;
        maskCtx.drawImage(maskImage, 0, 0);
        const imgData = maskCtx.getImageData(
            0,
            0,
            maskImage.width,
            maskImage.height
        );
        const data = imgData.data;

        // Converter SVG em máscara
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = (r + g + b) / 3;

            if (brightness > 100) {
                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
                data[i + 3] = 255;
            } else {
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
                data[i + 3] = 255;
            }
        }

        maskCtx.putImageData(imgData, 0, 0);
    }

    function draw() {
        time += 1;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;

        ctx.clearRect(0, 0, width, height);

        const grd = ctx.createRadialGradient(
            mouseX,
            mouseY,
            0,
            mouseX,
            mouseY,
            RADIUS
        );
        const hue = HUES[Math.floor((time / 60) % HUES.length)];
        grd.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.8)`);
        grd.addColorStop(1, `hsla(${hue}, 100%, 70%, 0)`);

        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, RADIUS, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(maskCanvas, 0, 0, width, height);
        ctx.globalCompositeOperation = "source-over";

        requestAnimationFrame(draw);
    }

    function resize() {
        canvas.width = width = window.innerWidth;
        canvas.height = height = window.innerHeight;
    }

    onMount(() => {
        ctx = canvas.getContext("2d")!;
        maskCanvas = document.createElement("canvas");
        maskCtx = maskCanvas.getContext("2d")!;

        maskImage = new Image();
        maskImage.src = "/circuit.webp";
        maskImage.onload = () => {
            createMaskFromImage();
            draw();
        };

        resize();
        window.addEventListener("resize", resize);

        return () => {
            window.removeEventListener("resize", resize);
        };
    });

    function handleMouseMove(event: MouseEvent) {
        mouseX = event.clientX;
        mouseY = event.clientY;
    }
</script>

<canvas bind:this={canvas} on:mousemove={handleMouseMove}></canvas>

<style>
    canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: black;
        display: block;
        mix-blend-mode: screen;
    }
</style>
