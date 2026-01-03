import { AbsoluteFill, useCurrentFrame } from 'remotion';

export const AnimatedGrid = ({ color = "rgba(255,255,255,0.2)" }: { color?: string }) => {
    const frame = useCurrentFrame();
    const offset = (frame * 2) % 50; // Move grid

    return (
        <AbsoluteFill style={{ overflow: 'hidden', zIndex: -1 }}>
            <div style={{
                position: 'absolute',
                top: -50,
                left: -50,
                right: -50,
                bottom: -50,
                background: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
                transform: `translateY(${offset}px) perspective(500px) rotateX(20deg)`,
                opacity: 0.2
            }} />
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, transparent 0%, #000 90%)' // Vignette
            }} />
        </AbsoluteFill>
    )
}
