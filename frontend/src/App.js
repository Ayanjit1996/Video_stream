import './App.css';
import Vid from './video_section';
import Search from './search';
import Vid_list from './vid_list';
import Subtitle from './subtitle_section';
import Navbar from './Navbar';
import { useState, useEffect } from 'react';
import Upload_window from './upload_window'; 
import axios from 'axios';    

function App() {
  // State variables
  const [enable, setEnable] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [uploader, setUploader] = useState("");
  const [latest_list, setLatestList] = useState([]);
  const [selectedVideoID, setSelectedVideoID] = useState(localStorage.getItem('selectedVideoID') || null);
  const [Title, setTitle] = useState(localStorage.getItem('Title') || null);
  const [Uploadsuccess, setUploadsuccess] = useState(false);
  const [sub, setSub] = useState(null);
  const [SerachTerm, setSerachTerm] = useState('');

  // Handlers
  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setEnable(false);
      setVideoFile(null);
      setUploader("");
    }, 500);
  };

  const updateUploader = (e) => {
    setUploader(e.target.value);
  };

  const handleFileChange = (event) => {
    setVideoFile(event.target.files[0]);
  };

  // Fetch latest video list
  const fetchList = async () => {
    try {
      const response = await axios.get('http://localhost:8000/');
      setLatestList(response.data);
      
    } catch (error) {
      console.error("Error fetching video list:", error);
    }
  };

useEffect(() => {
  fetchList();
  if (Uploadsuccess) {
    setUploadsuccess(false);
  }
}, [Uploadsuccess]);

  return (
    <div className="App">
      <div className="navbar_div">
        <Navbar setEnable={setEnable} setOpen={setOpen} />
      </div>
      <div className='body'>
        <div className="left-part">
          <Vid selectedVideoID={selectedVideoID} Title={Title} setSub={setSub}/>
          {selectedVideoID && <Search setSerachTerm={setSerachTerm} />}
          <Subtitle sub={sub} SerachTerm={SerachTerm} selectedVideoID={selectedVideoID}/>
        </div>
        <div className="right-part">
          <Vid_list 
            latest_list={latest_list} 
            setSelectedVideoID={setSelectedVideoID} 
            setTitle={setTitle} 
            setUploadsuccess={setUploadsuccess} 
          />
        </div>
      </div>
      {enable && (
        <Upload_window 
          isOpen={isOpen} 
          uploader={uploader} 
          videoFile={videoFile} 
          handleFileChange={handleFileChange} 
          handleClose={handleClose} 
          updateUploader={updateUploader} 
          setUploadsuccess={setUploadsuccess} 
        />
      )}
    </div>
  );
}

export default App;