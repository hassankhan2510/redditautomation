"use client"

import { Player } from '@remotion/player';
import { KineticText, getDuration } from './KineticText';

export const VideoPlayer = ({ data }: { data: any }) => {
    // Calculate total duration based on scenes
    const scenes = data.scenes || [];
    const durationInFrames = scenes.reduce((acc: number, scene: any) => acc + getDuration(scene), 0);

    // Fallback if no scenes (shouldn't happen)
    const finalDuration = durationInFrames > 0 ? durationInFrames : 150;

    return (
        <div className={`rounded-xl overflow-hidden shadow-2xl border bg-black mx-auto transition-all ${data.width === 1080 ? 'aspect-[9/16] max-w-sm' : 'aspect-video w-full'}`}>
            <Player
                component={KineticText}
                inputProps={{ scenes, mode: data.mode, backgroundUrl: data.backgroundUrl }}
                durationInFrames={finalDuration}
                durationInFrames={finalDuration}
                compositionWidth={data.width || 1920}
                compositionHeight={data.height || 1080}
                fps={30}
                style={{
                    width: '100%',
                    height: '100%',
                }}
                controls
                autoPlay
                loop
            />
        </div>
    );
};
