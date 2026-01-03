import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, useVideoConfig, Audio, Video, Series } from 'remotion';
import { AnimatedGrid } from './AnimatedGrid'; // Assuming AnimatedGrid is moved to its own file

// --- VISUAL ASSETS ---

opacity: 0.2
            }} />
    < div style = {{
    position: 'absolute',
        inset: 0,
            background: 'radial-gradient(circle, transparent 0%, #000 90%)' // Vignette
}} />
        </AbsoluteFill >
    )
}

// --- SUB-COMPONENTS ---

const TitleScene = ({ text, subtext, color }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const scale = spring({ frame, fps, from: 0.8, to: 1, config: { damping: 100, stiffness: 200 } });
    const opacity = interpolate(frame, [0, 15], [0, 1]);
    const glow = interpolate(frame, [0, 30], [0, 20]);

    return (
        <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: getColor(color), color: 'white' }}>
            <AnimatedGrid color="rgba(255,255,255,0.5)" />
            <h1 style={{
                fontSize: 140,
                fontWeight: 900,
                transform: `scale(${scale})`,
                opacity,
                textAlign: 'center',
                textShadow: `0 0 ${glow}px rgba(255,255,255,0.5)`,
                lineHeight: 0.9
            }}>
                {text.toUpperCase()}
            </h1>
            <h2 style={{ fontSize: 40, marginTop: 30, opacity: interpolate(frame, [15, 30], [0, 1]), fontWeight: 300, letterSpacing: 4 }}>
                {subtext}
            </h2>
        </AbsoluteFill>
    )
}

const ProblemScene = ({ text, color }: any) => {
    const frame = useCurrentFrame();
    const shake = Math.sin(frame * 0.8) * 5;
    const bgShake = Math.sin(frame * 0.2) * 20; // Subtle bg movement

    return (
        <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#dc2626', color: 'white' }}>
            <AnimatedGrid color="rgba(0,0,0,0.3)" />
            <h1 style={{
                fontSize: 110,
                fontWeight: 800,
                transform: `translateX(${shake}px)`,
                textShadow: '10px 10px 0px rgba(0,0,0,0.2)'
            }}>
                ⚠️ {text}
            </h1>
        </AbsoluteFill>
    )
}

const SolutionScene = ({ text, list, color }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    return (
        <AbsoluteFill style={{ padding: 80, background: '#16a34a', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <AnimatedGrid color="rgba(255,255,255,0.2)" />
            <h1 style={{ fontSize: 90, fontWeight: 800, marginBottom: 50 }}>{text}</h1>
            {list && list.map((item: string, i: number) => {
                const delay = i * 15;
                const slide = spring({ frame: frame - delay, fps, from: 50, to: 0 });
                const op = interpolate(frame - delay, [0, 10], [0, 1]);
                if (frame < delay) return null;
                return (
                    <div key={i} style={{
                        fontSize: 45,
                        marginBottom: 25,
                        transform: `translateY(${slide}px)`,
                        opacity: op,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 20,
                        fontWeight: 600
                    }}>
                        <div style={{ width: 40, height: 40, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', fontSize: 24 }}>✓</div>
                        {item}
                    </div>
                )
            })}
        </AbsoluteFill>
    )
}

const DefaultScene = ({ text, subtext, color }: any) => {
    return (
        <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: getColor(color), color: 'white' }}>
            <AnimatedGrid color="rgba(255,255,255,0.3)" />
            <h1 style={{ fontSize: 100, fontWeight: 800, textAlign: 'center', maxWidth: '80%' }}>
                {text}
            </h1>
            {subtext && <p style={{ marginTop: 30, fontSize: 30, opacity: 0.8 }}>{subtext}</p>}
        </AbsoluteFill>
    )
}


// --- MAIN ENGINE ---

export const KineticText = ({ scenes }: { scenes: any[] }) => {
    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            {/* BACKGROUND AUDIO (Royalty Free Placeholders) */}
            <Audio src="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" volume={0.1} loop />

            <Series>
                {scenes.map((scene, i) => {
                    const duration = getDuration(scene);
                    return (
                        <Series.Sequence key={i} durationInFrames={duration}>
                            {scene.type === 'title' && <TitleScene {...scene} />}
                            {scene.type === 'problem' && <ProblemScene {...scene} />}
                            {scene.type === 'solution' && <SolutionScene {...scene} />}
                            {/* Fallback */}
                            {!['title', 'problem', 'solution'].includes(scene.type) && <DefaultScene {...scene} />}
                        </Series.Sequence>
                    )
                })}
            </Series>
        </AbsoluteFill>
    );
};

// --- HELPERS ---

function getColor(name: string) {
    if (name === 'blue') return '#2563eb';
    if (name === 'purple') return '#7c3aed';
    if (name === 'orange') return '#f97316';
    if (name === 'black') return '#0f172a';
    return '#2563eb';
}

export function getDuration(scene: any) {
    // 30 frames = 1 second
    if (scene.type === 'title') return 90; // 3s
    if (scene.type === 'solution') return 150; // 5s
    return 90; // Default 3s
}
