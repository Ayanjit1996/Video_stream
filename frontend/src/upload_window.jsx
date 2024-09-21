import axios from 'axios';
import { useState } from 'react';

function Upload_window({ isOpen, uploader, videoFile, handleFileChange, handleClose, updateUploader, setUploadsuccess }) {
    const [isLoading, setIsLoading] = useState(false); 
    const [uploadSuccess, setUploadSuccess] = useState(false); 

    // Function to handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!videoFile || !uploader) {
            alert("Please select a video file and provide uploader name");
            return;
        }

        const formData = new FormData();
        formData.append("video", videoFile);
        formData.append("uploader", uploader);

        setIsLoading(true); // Start loading

        try {
            const response = await axios.post(
                "http://localhost:8000/upload/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            console.log(response);
            if (response.status === 200) {
                setUploadsuccess(true);
                setUploadSuccess(true); // Set upload success state
            } else {
                alert("Upload failed. Status: " + response.status);
            }
        } catch (error) {
            console.error("Error uploading video:", error);
            alert("Network error or server issue during upload");
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    return (
        <div className={`upload_window ${isOpen ? "open1" : "close1"}`}>
            <div className={`popup ${isOpen ? "open2" : "close2"}`}>
                <h2>Upload Video</h2>
                <form onSubmit={handleSubmit}>
                    <div className="file_area">
                        {isLoading ? (
                            <div className="loader_div">
                                <div className="loader"></div>
                                <div><p>Uploading...</p></div>
                            </div>
                        ) : uploadSuccess ? (
                            <div style={{ textAlign: "center" }}>
                                <span role="img" aria-label="success" >✅</span>
                                <p>Upload Successful!</p>
                            </div>
                        ) : videoFile ? (
                            <div style={{ textAlign: "center" }}>
                                <video controls style={{ width: "10%", maxWidth: "500px" }}>
                                    <source
                                        src={URL.createObjectURL(videoFile)}
                                        type={videoFile.type}
                                    />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        ) : (
                            <div style={{ textAlign: "center" }}>
                                <img
                                    src={`${process.env.PUBLIC_URL}/upload_icon.png`}
                                    style={{ width: "30px", height: "40px" }}
                                    alt="Icons Video File"
                                />
                                <p>Add a file +</p>
                            </div>
                        )}
                        <div className="choose">
                            <input
                                className="vid_input"
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                required
                            />
                            <input
                                className="uploader"
                                type="text"
                                placeholder="Uploader Name"
                                onChange={updateUploader}
                                value={uploader}
                                required
                            />
                        </div>
                    </div>
                    <div className="upload_wind_btn">
                        <button className="cancel_btn" type="button" onClick={handleClose}>
                            Cancel
                        </button>
                        <button className="upload_btn" type="submit" disabled={isLoading}>
                            Upload
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Upload_window;