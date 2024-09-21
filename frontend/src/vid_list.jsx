import React from 'react';

const Vid_list = ({ latest_list, setSelectedVideoID, setTitle, setUploadsuccess }) => {
    const handleVideoSelect = (video) => {
        setSelectedVideoID(null);
        setTimeout(() => {
            setSelectedVideoID(video.id);
            setTitle(video.title);
            setUploadsuccess(true);
        }, 100);
    };

    return (
        <div className="list_view">
            {latest_list.map((video, index) => (
                <div key={index} className="Card" onClick={() => handleVideoSelect(video)}>
                    <div className="thumbnail_block">
                        <img src={video.thumbnail_url} alt="thumbnail" className="thumbnail" />
                    </div>
                    <div className="video_info">
                        <div className="recom_vid_title">{video.title}</div>
                        <div className="metadata">Uploader - {video.uploader}</div>
                        <div className="metadata">Uploaded on - {new Date(video.created_at).toLocaleDateString("en-GB")}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Vid_list;