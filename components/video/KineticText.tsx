import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const KineticText = ({ title, subtitle, points, theme = 'dark' }: { title: string, subtitle: string, points: string[], theme?: 'dark' | 'light' }) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // 1. Background Animation (Dynamic Gradient)
    const bgOpacity = interpolate(frame, [0, 30], [0, 1]);
    const gradientPos = interpolate(frame, [0, 300], [0, 100]);

    // Theme Colors
    const isDark = theme === 'dark';
    const bgGradient = isDark
        ? `linear-gradient(${45 + gradientPos}deg, #1e1b4b, #312e81, #4c1d95)`
        : `linear-gradient(${45 + gradientPos}deg, #eff6ff, #dbeafe, #e0e7ff)`;
    const textColor = isDark ? '#fff' : '#1e3a8a';
    const accentColor = '#3b82f6';

    // 2. Title Animation (Spring Slide-Up)
    const titleY = spring({
        frame,
        fps,
        config: { damping: 12 },
        from: 100,
        to: 0,
    });
    const titleOpacity = interpolate(frame, [0, 20], [0, 1]);

    // 3. Subtitle Animation (Fade In)
    const subtitleOpacity = interpolate(frame, [20, 40], [0, 1]);

    // 4. Points Stagger Animation
    const renderPoints = points.map((point, i) => {
        const delay = 40 + (i * 20); // 40, 60, 80...
        const pointScale = spring({
            frame: frame - delay,
            fps,
            config: { damping: 12 },
        });

        // Only render if animation started
        if (frame < delay) return null;

        return (
            <div key={i} style={{
                transform: `scale(${pointScale})`,
                opacity: pointScale,
                marginBottom: 30,
                display: 'flex',
                alignItems: 'center',
                gap: 20
            }}>
                <div style={{
                    width: 12, height: 12, borderRadius: '50%', backgroundColor: accentColor, flexShrink: 0
                }} />
                <span style={{ fontSize: 40, fontWeight: 500 }}>{point}</span>
            </div>
        );
    });

    return (
        <AbsoluteFill style={{ background: bgGradient, opacity: bgOpacity, color: textColor, justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
            <div style={{ width: '80%', textAlign: 'left' }}>
                <h1 style={{
                    fontSize: 90,
                    fontWeight: 800,
                    lineHeight: 1,
                    marginBottom: 20,
                    transform: `translateY(${titleY}px)`,
                    opacity: titleOpacity
                }}>
                    {title}
                </h1>
                <h2 style={{
                    fontSize: 40,
                    fontWeight: 300,
                    opacity: subtitleOpacity,
                    marginBottom: 80,
                    color: isDark ? '#94a3b8' : '#64748b'
                }}>
                    {subtitle}
                </h2>
                <div>
                    {renderPoints}
                </div>
            </div>
        </AbsoluteFill>
    );
};
