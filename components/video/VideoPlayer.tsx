"use client"

import { Player } from '@remotion/player';
import { KineticText } from './KineticText';

export const VideoPlayer = ({ data }: { data: any }) => {
    // Default duration: 3 sec intro + 2 sec per point
    const durationInFrames = (30 * 30) + (data.points.length * 60) + 60;

    return (
        <div className="rounded-xl overflow-hidden shadow-2xl border aspect-video bg-black">
            <Player
                component={KineticText}
                inputProps={data}
                durationInFrames={durationInFrames}
                compositionWidth={1920}
                compositionHeight={1080}
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
