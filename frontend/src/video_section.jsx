import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function Vid({ selectedVideoID, Title, setSub, seconds, setSeconds }) {
    const [subtitles, setSubtitles] = useState([]);
    const [loading, setLoading] = useState(false);
    const videoRef = useRef(null);
    const displayTitle = Title || "None selected";

    useEffect(() => {
        const fetchVideoData = async () => {
            if (!selectedVideoID) return;

            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:8000/play/${selectedVideoID}/`);
                const videoUrl = response.data.video_url;
                await loadSubtitles(response.data.subtitles);
                videoRef.current.src = videoUrl;
                videoRef.current.load();

            } catch (error) {
                console.error("Error fetching video data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideoData();

        return () => {
            if (videoRef.current && videoRef.current.src) {
                URL.revokeObjectURL(videoRef.current.src);
            }
        };
    }, [selectedVideoID, setSub]);

    const loadSubtitles = async (subtitlesArray) => {
        const allSubtitles = {};
        const subtitleFiles = [];

        await Promise.all(
            subtitlesArray.map(async (subtitle) => {
                try {
                    const subtitleResponse = await axios.get(`http://localhost:8000/subtitles/${selectedVideoID}/${subtitle.language}/`);
                    const base64Data = subtitleResponse.data.subtitle_file;
                    const binaryString = atob(base64Data);
                    const binaryLength = binaryString.length;
                    const bytes = new Uint8Array(binaryLength);
                    for (let i = 0; i < binaryLength; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    const blob = new Blob([bytes], { type: 'application/x-subrip' });
                    const url = URL.createObjectURL(blob);
                    allSubtitles[subtitle.language] = JSON.parse(subtitleResponse.data.subtitle);
                    subtitleFiles.push({ language: subtitle.language, subtitle_file_url: url });
                } catch (error) {
                    console.error(`Error fetching subtitle for language ${subtitle.language}:`, error);
                }
            })
        );

        setSub(allSubtitles);
        setSubtitles(subtitleFiles);
    };

    return (
        <div className="main_vid">
            <div className="play_area">
                {loading && <div className="loading-circle">Loading...</div>}
                <video
                    className="play_area"
                    width="1000"
                    height="500"
                    controls
                    ref={videoRef}
                    preload="auto"
                    onLoadedMetadata={() => {
                        videoRef.current.controls = true;
                    }}
                    onError={(error) => console.error("Error loading video:", error)}
                >
                    {subtitles.map((subtitle, index) => (
                        <track
                            key={index}
                            src={subtitle.subtitle_file_url}
                            label={subtitle.language}
                            kind="subtitles"
                            srcLang={subtitle.language}
                            default={subtitle.language === "eng"}
                        />
                    ))}
                    Your browser does not support the video tag.
                </video>
            </div>
            <header className="title-playing">{displayTitle}</header>
        </div>
    );
}

export default Vid;