import React, { useState, useEffect } from "react";
import axios from "axios";

function Subtitle({ sub, SerachTerm, selectedVideoID }) {
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [subtitleArray, setSubtitleArray] = useState([]);
    const [filteredSubtitles, setFilteredSubtitles] = useState([]);

    useEffect(() => {
        if (sub && Object.keys(sub).length > 0) {
            const firstLanguage = Object.keys(sub)[0];
            setSelectedLanguage(firstLanguage);
        }
    }, [sub]);

    useEffect(() => {
        if (selectedLanguage && sub[selectedLanguage]) {
            const subtitles = sub[selectedLanguage];
            const newSubtitleArray = Object.entries(subtitles).map(([timestamp, dialogue]) => ({
                timestamp,
                dialogue,
                language: selectedLanguage
            }));
            setSubtitleArray(newSubtitleArray);
            setFilteredSubtitles(newSubtitleArray);
        }
    }, [selectedLanguage, sub]);

    useEffect(() => {
        if (SerachTerm) {
            const allSubtitles = Object.keys(sub).flatMap(lang => 
                Object.entries(sub[lang]).map(([timestamp, dialogue]) => ({
                    timestamp,
                    dialogue,
                    language: lang
                }))
            );

            const filtered = allSubtitles.filter(subtitle => 
                subtitle.dialogue.toLowerCase().includes(SerachTerm.toLowerCase())
            );
            setFilteredSubtitles(filtered);
        } else {
            setFilteredSubtitles(subtitleArray);
        }
    }, [SerachTerm, subtitleArray, sub]);

    const handleLanguageChange = (event) => {
        setSelectedLanguage(event.target.value);
    };

    const handleTimestampClick = async (timestamp) => {
        console.log(`Seeking to timestamp: ${timestamp}`);
        console.log(selectedVideoID);
        
        try {
            const videoElement = document.querySelector('video');
    
            if (videoElement) {
                const timeParts = timestamp.split(':');
                const seconds = (+timeParts[0] * 60 * 60) + (+timeParts[1] * 60) + (+timeParts[2]);
                console.log(seconds)
                videoElement.currentTime = seconds;
                videoElement.play();
            }
        } catch (error) {
            console.error("Error seeking video:", error);
        }
    };

    if (!sub || typeof sub !== 'object' || Object.keys(sub).length === 0) {
        return <div>No subtitles available.</div>;
    }

    return (
        <div className="subtitle">
            <select className="selector" value={selectedLanguage} onChange={handleLanguageChange}>
                {Object.keys(sub).map((language) => (
                    <option key={language} value={language}>
                        {language}
                    </option>
                ))}
            </select>
            <ul>
                {filteredSubtitles.length > 0 ? filteredSubtitles.map((subtitle, index) => (
                    <li key={index}>
                        <div className="dialogue">
                            <button
                                className="timestamp"
                                onClick={() => handleTimestampClick(subtitle.timestamp)}>
                                {subtitle.timestamp}
                            </button>{" "}
                            <div>
                                &nbsp;&nbsp;• {subtitle.dialogue} ({subtitle.language})
                            </div>
                        </div>
                    </li>
                )) : (
                    <li>No matching dialogues found.</li>
                )}
            </ul>
        </div>
    );
}

export default Subtitle;