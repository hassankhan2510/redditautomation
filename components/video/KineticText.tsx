import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, useVideoConfig, Audio, Series, spring, Video } from 'remotion';
import { AnimatedGrid } from './AnimatedGrid'; // Assuming AnimatedGrid is moved to its own file

// --- VISUAL ASSETS ---

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


// --- KARAOKE COMPONENT ---

const KaraokeWord = ({ word, index, framesPerWord }: { word: string, index: number, framesPerWord: number }) => {
    const frame = useCurrentFrame();

    // Determine state
    const startFrame = index * framesPerWord;
    const endFrame = (index + 1) * framesPerWord;

    // Is Active?
    const isActive = frame >= startFrame && frame < endFrame;
    const isPast = frame >= endFrame;

    const scale = spring({
        frame: frame - startFrame,
        fps: 30,
        config: { damping: 200 }
    });

    const activeScale = isActive ? 1.3 : 1;
    const opacity = isPast ? 0.5 : (isActive ? 1 : 0.3); // Past=Dim, Active=Bright, Future=Ghost
    const color = isActive ? '#fbbf24' : (isPast ? 'white' : 'rgba(255,255,255,0.5)');

    return (
        <span style={{
            fontSize: 70,
            fontWeight: 900,
            color: color,
            textShadow: isActive ? '0 0 20px rgba(251, 191, 36, 0.5)' : 'none',
            transform: `scale(${isActive ? scale + 0.2 : 1})`,
            display: 'inline-block',
            transition: 'color 0.1s'
        }}>
            {word}
        </span>
    )
}


// --- MAIN ENGINE ---

export const KineticText = ({ scenes, mode = 'default', backgroundUrl }: { scenes: any[], mode?: string, backgroundUrl?: string }) => {

    // STORY MODE (Cash Cow / Kids Story)
    if (mode === 'story') {
        return (
            <AbsoluteFill className="bg-black text-white">
                {/* BOTTOM: GAMEPLAY LOOP (Retention Hook) */}
                <AbsoluteFill style={{ top: '50%', height: '50%', overflow: 'hidden' }}>
                    <Video
                        src={backgroundUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        muted
                        loop
                    />
                </AbsoluteFill>

                {/* TOP: TEXT (The Hook) */}
                <AbsoluteFill style={{ height: '50%', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                    <Series>
                        {scenes.map((scene: any, i: number) => {
                            const duration = scene.duration || getDuration(scene)

                            // KARAOKE LOGIC
                            const words = scene.text.split(" ")
                            const framesPerWord = duration / words.length

                            return (
                                <Series.Sequence key={i} durationInFrames={duration}>
                                    {scene.audioUrl && (
                                        <Audio src={scene.audioUrl} />
                                    )}
                                    <div className="flex flex-col items-center justify-center h-full w-full px-12">
                                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 max-w-4xl">
                                            {words.map((word: string, wIndex: number) => {
                                                // Calculate if this word is active based on current frame relative to this sequence
                                                // Series.Sequence gives us isolated frame scope? No, useCurrentFrame is global in absolute? 
                                                // Actually Series nests it, so val 0 is start of sequence.
                                                // We need a component to isolate the frame context.
                                                return (
                                                    <KaraokeWord key={wIndex} word={word} index={wIndex} framesPerWord={framesPerWord} />
                                                )
                                            })}
                                        </div>

                                        {scene.subtext && (
                                            <h2 className="text-yellow-400 mt-8 text-4xl uppercase tracking-widest font-black drop-shadow-lg animate-pulse">{scene.subtext}</h2>
                                        )}
                                    </div>
                                </Series.Sequence>
                            )
                        })}
                    </Series>
                </AbsoluteFill>

                {/* Background Music */}
                <Audio src="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" volume={0.1} loop />
            </AbsoluteFill>
        )
    }

    // DEFAULT MODE (Motion Graphics)
    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            {/* BACKGROUND AUDIO */}
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
