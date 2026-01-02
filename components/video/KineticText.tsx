import { AbsoluteFill, Series, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

// --- SUB-COMPONENTS ---

const TitleScene = ({ text, subtext, color }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const scale = spring({ frame, fps, from: 0.5, to: 1, config: { damping: 12 } });
    const opacity = interpolate(frame, [0, 20], [0, 1]);

    return (
        <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: getColor(color), color: 'white' }}>
            <h1 style={{ fontSize: 120, fontWeight: 900, transform: `scale(${scale})`, opacity, textAlign: 'center' }}>
                {text.toUpperCase()}
            </h1>
            <h2 style={{ fontSize: 40, marginTop: 20, opacity: interpolate(frame, [20, 40], [0, 1]) }}>{subtext}</h2>
        </AbsoluteFill>
    )
}

const ProblemScene = ({ text, color }: any) => {
    const frame = useCurrentFrame();
    // Shake effect
    const shake = Math.sin(frame * 0.5) * 10;

    return (
        <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#ef4444', color: 'white' }}>
            <h1 style={{ fontSize: 100, fontWeight: 800, transform: `translateX(${shake}px)` }}>
                ⚠️ {text}
            </h1>
        </AbsoluteFill>
    )
}

const SolutionScene = ({ text, list, color }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    return (
        <AbsoluteFill style={{ padding: 60, background: '#22c55e', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ fontSize: 80, fontWeight: 800, marginBottom: 40 }}>{text}</h1>
            {list && list.map((item: string, i: number) => {
                const delay = i * 20;
                const slide = spring({ frame: frame - delay, fps, from: 100, to: 0 });
                const op = interpolate(frame - delay, [0, 10], [0, 1]);
                if (frame < delay) return null;
                return (
                    <div key={i} style={{ fontSize: 40, marginBottom: 20, transform: `translateX(${slide}px)`, opacity: op, display: 'flex', alignItems: 'center', gap: 10 }}>
                        ✅ {item}
                    </div>
                )
            })}
        </AbsoluteFill>
    )
}

const DefaultScene = ({ text, subtext, color }: any) => {
    return (
        <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: getColor(color), color: 'white' }}>
            <h1 style={{ fontSize: 90, fontWeight: 700, textAlign: 'center', maxWidth: '80%' }}>
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
