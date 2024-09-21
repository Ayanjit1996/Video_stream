import React from "react";

function Navbar({setEnable,setOpen}){
    return (
        <div className="navbar">
            <div className="bname" href="#">
                Playlist
            </div>
            <div className="upload" href="#">
                <img
                src={`${process.env.PUBLIC_URL}/upload.png`}
                style={{ width: "20px", height: "20px", marginRight: "10px" }}
                alt="Upload"
                />
                <button className="bt" onClick={() => { setEnable(true); setOpen(true); }}>Upload</button>
            </div>
        </div>
    );
}

export default Navbar;